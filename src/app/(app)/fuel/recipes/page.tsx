import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RecipeCard } from '@/components/fuel/recipe-card';
import { InspireVideoCard } from '@/components/fuel/inspire-video-card';
import type { RecipeData } from '@/types/ai';
import {
  fallbackInspiration,
  fallbackRecipes,
  pickRotatingItems,
  type InspireItem,
} from '@/lib/content/wellness-content';
import { findYouTubeVideoByQuery, getYouTubeDurationsByUrl } from '@/lib/youtube-metadata';

export const metadata = { title: 'Recipes - FitNexus' };

interface RemoteWellnessContent {
  recipes?: RecipeData[];
  inspiration?: InspireItem[];
}

/**
 * Normalizes text for reliable matching
 */
function normalize(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

/**
 * Mapping of dietary keywords to ingredients that must be excluded.
 */
const restrictionBlocks: Record<string, string[]> = {
  vegan: ['chicken', 'fish', 'meat', 'beef', 'pork', 'egg', 'milk', 'yogurt', 'ghee', 'paneer', 'honey', 'cheese', 'butter', 'cream'],
  vegetarian: ['chicken', 'fish', 'meat', 'beef', 'pork', 'lamb'],
  gluten: ['wheat', 'maida', 'barley', 'rye', 'bread', 'flour', 'pasta', 'couscous'],
  dairy: ['milk', 'paneer', 'yogurt', 'ghee', 'cheese', 'butter', 'cream', 'lactose'],
  nut: ['peanut', 'almond', 'walnut', 'cashew', 'pistachio', 'hazelnut', 'pecan'],
  seafood: ['fish', 'shrimp', 'prawn', 'crab', 'lobster', 'salmon', 'tuna'],
};

async function loadRemoteContent(): Promise<RemoteWellnessContent | null> {
  const url = process.env.CONTENT_FEED_URL;
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } }); // 30 mins
    return res.ok ? (await res.json()) : null;
  } catch {
    return null;
  }
}

function isRecipeSafe(recipe: RecipeData, userRestrictions: string[]): boolean {
  if (!userRestrictions.length) return true;

  const recipeContent = normalize([
    recipe.name,
    recipe.description,
    ...recipe.ingredients,
    ...recipe.dietaryTags
  ].join(' '));

  // Check every user restriction against our banned lists
  return userRestrictions.every(restriction => {
    const normalizedRes = restriction.toLowerCase();
    // Find if the user's restriction (e.g., "vegan") matches any of our block keys
    const blockKey = Object.keys(restrictionBlocks).find(k => normalizedRes.includes(k));
    
    if (!blockKey) return true; // No specific block rules for this restriction

    const bannedTerms = restrictionBlocks[blockKey];
    return !bannedTerms.some(term => recipeContent.includes(term));
  });
}

function normalizeToken(s: string): string {
  return s
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Match diet preference to recipe tags. Hyphenated tags (e.g. low-carb) and
 * "Balanced" recipes are handled so filters do not hide every fallback.
 */
function matchesPreference(recipe: RecipeData, preference: string): boolean {
  if (preference === 'BALANCED') return true;
  const pref = normalizeToken(preference);
  const tags = recipe.dietaryTags.map((t) => normalizeToken(t));
  if (tags.some((t) => t.includes('balanced'))) return true;
  return recipe.dietaryTags.some((t) => {
    const tag = normalizeToken(t);
    if (tag.includes(pref) || (pref.length > 2 && pref.includes(tag))) return true;
    const words = pref.split(' ').filter((w) => w.length > 2);
    return words.length > 0 && words.every((w) => tag.includes(w));
  });
}

export default async function RecipesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [profile, remote] = await Promise.all([
    prisma.healthProfile.findUnique({
      where: { userId: session.user.id },
      select: { dietaryPreference: true, dietaryRestrictions: true },
    }),
    loadRemoteContent(),
  ]);

  const dietPref = profile?.dietaryPreference || 'BALANCED';
  const restrictions = profile?.dietaryRestrictions || [];

  const allRecipes: RecipeData[] = remote?.recipes?.length
    ? (remote.recipes as RecipeData[])
    : fallbackRecipes;
  const inspiration: InspireItem[] = remote?.inspiration?.length
    ? (remote.inspiration as InspireItem[])
    : fallbackInspiration;

  // Deterministic rotation based on date
  const seed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ''));

  const safe = (recipe: RecipeData) => isRecipeSafe(recipe, restrictions);

  let baseRecipes: RecipeData[] = allRecipes
    .filter(safe)
    .filter((recipe: RecipeData) => matchesPreference(recipe, dietPref));
  let relaxedNote: string | null = null;

  if (baseRecipes.length === 0) {
    const preferenceFallback = allRecipes.filter(safe);
    if (preferenceFallback.length > 0) {
      baseRecipes = preferenceFallback;
      relaxedNote =
        'No recipes matched your diet style exactly; showing options that still respect your restrictions.';
    }
  }

  if (baseRecipes.length === 0) {
    baseRecipes = fallbackRecipes.filter(safe);
    if (baseRecipes.length > 0) {
      relaxedNote =
        'Showing curated defaults that match your safety filters. Adjust profile settings for more variety.';
    }
  }

  const rotatedInspiration = pickRotatingItems(inspiration, seed, 3);

  const recipeWithVideos = await Promise.all(
    baseRecipes.map(async (recipe: RecipeData) => {
      if (recipe.cookVideoUrl) return recipe;
      const match = await findYouTubeVideoByQuery(`${recipe.name} full recipe tutorial not shorts`);
      if (!match) return recipe;
      return {
        ...recipe,
        cookVideoUrl: match.url,
        cookVideoTitle: recipe.cookVideoTitle || match.title,
      };
    })
  );

  const durationSources = [
    ...recipeWithVideos.map((r: RecipeData) => r.cookVideoUrl).filter(Boolean) as string[],
    ...rotatedInspiration.map((i: InspireItem) => i.link).filter(Boolean),
  ];
  const durationByUrl = await getYouTubeDurationsByUrl(durationSources);

  const enrichedRecipes = recipeWithVideos.map((recipe: RecipeData) => ({
    ...recipe,
    cookVideoDuration:
      (recipe.cookVideoUrl ? durationByUrl[recipe.cookVideoUrl] : undefined)
      || recipe.cookVideoDuration,
  }));

  const enrichedInspiration = rotatedInspiration.map((item: InspireItem) => ({
    ...item,
    duration: durationByUrl[item.link] || item.duration,
  }));

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Your Kitchen</h1>
        <p className="text-muted-foreground">
          Showing {dietPref.toLowerCase().replace('_', ' ')} recipes
          {restrictions.length > 0 && ` excluding: ${restrictions.join(', ')}`}.
        </p>
      </header>

      <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <h2 className="text-sm font-semibold text-amber-200">Food Safety Note</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-100/90">
          <li>AI can make mistakes, so please recheck all ingredients based on your food dietary restrictions.</li>
          <li>Please review labels and substitutions in your kitchen before cooking.</li>
        </ul>
      </section>

      {relaxedNote && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary-foreground/90">
          {relaxedNote}
        </div>
      )}

      <main className="space-y-12">
        <section>
          {enrichedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrichedRecipes.map((recipe: RecipeData) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed p-12 text-center space-y-3">
              <h3 className="text-lg font-medium">No matches found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                We couldn&apos;t find recipes that meet all your dietary restrictions. Try adjusting your profile settings.
              </p>
            </div>
          )}
        </section>

        <hr className="border-border" />

        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold tracking-tight">Daily Inspiration</h2>
            <p className="text-muted-foreground">
              Mindfulness and movement to complement your nutrition.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {enrichedInspiration.map((item) => (
              <InspireVideoCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}