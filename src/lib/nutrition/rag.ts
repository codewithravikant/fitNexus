import 'server-only';

import { prisma } from '@/lib/prisma';

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

export interface RecipeSnippet {
  id: string;
  title: string;
  instructions: string | null;
  nutrition: { calories: number; proteinG: number; carbsG: number; fatsG: number } | null;
}

/**
 * Retrieve top-k catalog recipes by cosine similarity on JSON embedding arrays.
 * Seed uses 64-dim synthetic embeddings; production can use 1536-dim OpenAI vectors.
 */
export async function retrieveSimilarRecipes(
  queryEmbedding: number[],
  limit = 8
): Promise<RecipeSnippet[]> {
  const rows = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      instructions: true,
      embedding: true,
      nutritionFacts: { select: { calories: true, proteinG: true, carbsG: true, fatsG: true } },
    },
    take: 600,
  });

  const scored = rows
    .map((r) => {
      const emb = r.embedding as unknown as number[] | null;
      if (!emb?.length) return { r, score: -1 };
      const dim = Math.min(emb.length, queryEmbedding.length);
      const a = emb.slice(0, dim);
      const b = queryEmbedding.slice(0, dim);
      return { r, score: cosineSimilarity(a, b) };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ r }) => ({
    id: r.id,
    title: r.title,
    instructions: r.instructions,
    nutrition: r.nutritionFacts
      ? {
          calories: r.nutritionFacts.calories,
          proteinG: r.nutritionFacts.proteinG,
          carbsG: r.nutritionFacts.carbsG,
          fatsG: r.nutritionFacts.fatsG,
        }
      : null,
  }));
}
