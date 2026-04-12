import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NutritionOverview } from '@/components/fuel/nutrition-overview';
import { MealLogRecap } from '@/components/fuel/meal-log-recap';
import { NutritionCard } from '@/components/home/nutrition-card';
import { LogMealDialog } from '@/components/fuel/log-meal-dialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChefHat, Leaf } from 'lucide-react';
import { StaggerContainer, FadeUpCard } from '@/components/ui/motion-wrappers';
import { fallbackRecipes } from '@/lib/content/wellness-content';
import { deriveMacroTargets } from '@/lib/nutrition/tdee';
import { MacroPieChart } from '@/components/fuel/macro-pie-chart';
import { CalorieBalanceChart } from '@/components/fuel/calorie-balance-chart';
import { MealPlanPanel } from '@/components/fuel/meal-plan-panel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Intake - FitNexus' };

export default async function FuelPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [profile, meals, recentInsight, latestMealPlan] = await Promise.all([
    prisma.healthProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.mealLog.findMany({
      where: { userId: session.user.id },
      orderBy: { loggedAt: 'desc' },
      take: 7,
    }),
    prisma.aIInsight.findFirst({
      where: {
        userId: session.user.id,
        modelUsed: { not: 'observation_summary_v1' },
      },
      orderBy: { generatedAt: 'desc' },
      select: { recommendations: true },
    }),
    prisma.mealPlan.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const dietPref = profile?.dietaryPreference || 'BALANCED';

  const macroTargets =
    profile != null
      ? deriveMacroTargets(
          profile.weightKg,
          profile.heightCm,
          profile.age,
          profile.gender,
          profile.weeklyActivityFrequency,
          profile.primaryGoal,
          profile.targetDirection
        )
      : null;

  const calorieChartDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().slice(0, 10),
      target: macroTargets?.calorieTarget ?? 2000,
      loggedEstimate: undefined as number | undefined,
    };
  });

  // Extract smart meal from the latest AI-generated daily plan
  const recs = recentInsight?.recommendations as Record<string, unknown> | null;
  const aiSmartMeal = recs?.smartMeal as {
    name: string; description: string; prepTime: string;
    ingredients: string[]; macroHighlights?: string; dietaryTags: string[];
  } | undefined;

  const smartMeal = aiSmartMeal || {
    name: 'Mediterranean Quinoa Bowl',
    description: 'A balanced bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing',
    prepTime: '25 min',
    ingredients: ['Quinoa', 'Cherry tomatoes', 'Cucumber', 'Chickpeas', 'Feta', 'Tahini'],
    macroHighlights: '35g protein, 45g carbs',
    dietaryTags: [dietPref.replace('_', ' ')],
  };
  const foodInspiration = fallbackRecipes.slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-heading drop-shadow-sm">Intake</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Nutrition overview &amp; recipes</p>
        </div>
        <div className="flex items-center gap-2">
          <LogMealDialog />
          <Link href="/fuel/recipes">
            <Button variant="outline" className="gap-2 glass-panel border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all">
              <ChefHat className="h-4 w-4 text-primary" /> Recipes
            </Button>
          </Link>
        </div>
      </div>

      <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <FadeUpCard className="p-0 bg-transparent border-none shadow-none">
            <NutritionOverview dietaryPreference={dietPref} />
          </FadeUpCard>
          {macroTargets ? (
            <FadeUpCard>
              <Card className="border-primary/15">
                <CardHeader>
                  <CardTitle className="text-base">Macro targets (TDEE-based)</CardTitle>
                  <CardDescription>Daily distribution from your profile and activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <MacroPieChart
                    proteinG={macroTargets.proteinG}
                    carbsG={macroTargets.carbsG}
                    fatsG={macroTargets.fatsG}
                  />
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    ~{Math.round(macroTargets.calorieTarget)} kcal / day
                  </p>
                </CardContent>
              </Card>
            </FadeUpCard>
          ) : null}
          <FadeUpCard>
            <Card className="border-primary/15">
              <CardHeader>
                <CardTitle className="text-base">Calorie balance (7 days)</CardTitle>
                <CardDescription>Target line vs balance when meal kcal are tracked</CardDescription>
              </CardHeader>
              <CardContent>
                <CalorieBalanceChart days={calorieChartDays} />
              </CardContent>
            </Card>
          </FadeUpCard>
          <FadeUpCard>
            <MealPlanPanel
              initialPlan={
                latestMealPlan
                  ? {
                      planJson: latestMealPlan.planJson,
                      fallbackUsed: latestMealPlan.fallbackUsed,
                      createdAt: latestMealPlan.createdAt.toISOString(),
                    }
                  : null
              }
            />
          </FadeUpCard>
          <FadeUpCard>
            <NutritionCard smartMeal={smartMeal} dietaryPreference={dietPref} />
          </FadeUpCard>
        </div>
        <div className="space-y-5">
          <FadeUpCard className="p-0 bg-transparent border-none shadow-none">
            <MealLogRecap
              meals={meals.map((m: { mealType: string; description: string | null; loggedAt: Date }) => ({
                mealType: m.mealType,
                description: m.description ?? undefined,
                loggedAt: m.loggedAt.toISOString(),
              }))}
            />
          </FadeUpCard>
          <FadeUpCard>
            <div className="space-y-3">
              <h3 className="text-sm text-green-400 font-semibold tracking-wide uppercase font-heading">
                Inspire Me - Food
              </h3>
              <p className="text-xs text-muted-foreground">
                Light, food-focused inspiration from your intake lane.
              </p>
              <div className="space-y-2">
                {foodInspiration.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-green-400/30 bg-green-400/10 p-3"
                  >
                    <p className="text-xs font-semibold text-green-300 inline-flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      {item.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUpCard>
        </div>
      </StaggerContainer>
    </div>
  );
}
