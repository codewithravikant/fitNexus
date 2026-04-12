import type { Ingredient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { normalizeIngredientName, assertPositiveQuantity, clampKcal, clampMacroG } from '@/lib/nutrition/units';
import type { IngredientQuantity } from '@/lib/nutrition/units';

export interface CalculateNutritionInput {
  ingredients: IngredientQuantity[];
  servings: number;
}

export interface CalculateNutritionResult {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  /** Totals for the full recipe (before dividing by servings) */
  totals: { calories: number; protein: number; carbs: number; fats: number };
  servings: number;
  /** Names we could not resolve in the ingredient catalog */
  unresolved: string[];
}

/** Scale per-100 (g or ml per `Ingredient.basis`) nutrition values. */
function scaleFrom100(
  ing: Pick<Ingredient, 'caloriesPer100' | 'proteinPer100' | 'carbsPer100' | 'fatPer100'>,
  qty: number
): { cal: number; p: number; c: number; f: number } {
  const factor = qty / 100;
  return {
    cal: ing.caloriesPer100 * factor,
    p: ing.proteinPer100 * factor,
    c: ing.carbsPer100 * factor,
    f: ing.fatPer100 * factor,
  };
}

/**
 * Computes nutrition from catalog ingredients only — never guesses macros.
 * Used by the `calculate_nutrition` AI tool and server-side validation.
 */
export async function calculateNutritionFromDb(input: CalculateNutritionInput): Promise<CalculateNutritionResult> {
  assertPositiveQuantity(input.servings, 'servings');
  if (!input.ingredients?.length) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
      servings: input.servings,
      unresolved: [],
    };
  }

  let tCal = 0,
    tP = 0,
    tC = 0,
    tF = 0;
  const unresolved: string[] = [];

  const norms = input.ingredients.map((i) => ({
    raw: i.name,
    norm: normalizeIngredientName(i.name),
    quantity: i.quantity,
    unit: i.unit,
  }));

  const uniqueNorms = [...new Set(norms.map((x) => x.norm))];
  const rows = await prisma.ingredient.findMany({
    where: { nameNorm: { in: uniqueNorms } },
  });
  const byNorm = new Map(rows.map((r) => [r.nameNorm, r]));

  for (const line of norms) {
    assertPositiveQuantity(line.quantity, line.raw);
    const ing = byNorm.get(line.norm);
    if (!ing) {
      unresolved.push(line.raw);
      continue;
    }
    const s = scaleFrom100(ing, line.quantity);
    tCal += s.cal;
    tP += s.p;
    tC += s.c;
    tF += s.f;
  }

  const div = input.servings;
  return {
    calories: clampKcal(tCal / div),
    protein: clampMacroG(tP / div),
    carbs: clampMacroG(tC / div),
    fats: clampMacroG(tF / div),
    totals: {
      calories: clampKcal(tCal),
      protein: clampMacroG(tP),
      carbs: clampMacroG(tC),
      fats: clampMacroG(tF),
    },
    servings: input.servings,
    unresolved,
  };
}

/** JSON-schema-friendly tool parameters (Phase2 section 5). */
export const calculateNutritionToolDefinition = {
  type: 'function' as const,
  function: {
    name: 'calculate_nutrition',
    description:
      'Compute calories and macros (kcal, protein, carbs, fats) from ingredient quantities using the server nutrition database. Never invent numbers — always call this for any recipe totals.',
    parameters: {
      type: 'object',
      properties: {
        ingredients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Ingredient name matching the catalog (e.g. oats, chicken breast)' },
              quantity: { type: 'number', description: 'Amount in g or ml' },
              unit: { type: 'string', enum: ['g', 'ml'] },
            },
            required: ['name', 'quantity', 'unit'],
          },
        },
        servings: { type: 'number', description: 'Number of servings to divide totals by', minimum: 0.1 },
      },
      required: ['ingredients', 'servings'],
    },
  },
};

export function parseCalculateNutritionArgs(raw: unknown): CalculateNutritionInput {
  const o = raw as Record<string, unknown>;
  const servings = Number(o.servings);
  if (!Number.isFinite(servings) || servings <= 0) throw new Error('Invalid servings');
  const arr = o.ingredients;
  if (!Array.isArray(arr)) throw new Error('ingredients must be an array');
  const ingredients: IngredientQuantity[] = [];
  for (const item of arr) {
    const it = item as Record<string, unknown>;
    const name = String(it.name ?? '');
    const quantity = Number(it.quantity);
    const unit = it.unit === 'ml' ? 'ml' : 'g';
    if (!name.trim() || !Number.isFinite(quantity) || quantity <= 0) continue;
    ingredients.push({ name, quantity, unit });
  }
  return { ingredients, servings };
}
