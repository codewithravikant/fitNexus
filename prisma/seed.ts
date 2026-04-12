/**
 * Seeds 500+ ingredients and 500+ recipes for Phase 2 RAG / nutrition catalog.
 * Run: `npx prisma db seed` (requires DATABASE_URL).
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { normalizeIngredientName } from '../src/lib/nutrition/units';

const STAPLES: Array<{
  name: string;
  category: string;
  basis: 'PER_100G' | 'PER_100ML';
  caloriesPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
}> = [
  { name: 'oats dry', category: 'grain', basis: 'PER_100G', caloriesPer100: 389, proteinPer100: 17, carbsPer100: 66, fatPer100: 7 },
  { name: 'brown rice cooked', category: 'grain', basis: 'PER_100G', caloriesPer100: 112, proteinPer100: 2.3, carbsPer100: 24, fatPer100: 0.9 },
  { name: 'quinoa cooked', category: 'grain', basis: 'PER_100G', caloriesPer100: 120, proteinPer100: 4.4, carbsPer100: 21, fatPer100: 1.9 },
  { name: 'chicken breast skinless', category: 'protein', basis: 'PER_100G', caloriesPer100: 165, proteinPer100: 31, carbsPer100: 0, fatPer100: 3.6 },
  { name: 'egg whole', category: 'protein', basis: 'PER_100G', caloriesPer100: 143, proteinPer100: 13, carbsPer100: 1.1, fatPer100: 9.5 },
  { name: 'greek yogurt plain', category: 'dairy', basis: 'PER_100G', caloriesPer100: 97, proteinPer100: 9, carbsPer100: 3.9, fatPer100: 5 },
  { name: 'milk 2 percent', category: 'dairy', basis: 'PER_100ML', caloriesPer100: 50, proteinPer100: 3.3, carbsPer100: 4.9, fatPer100: 2 },
  { name: 'broccoli steamed', category: 'veg', basis: 'PER_100G', caloriesPer100: 35, proteinPer100: 2.4, carbsPer100: 7, fatPer100: 0.4 },
  { name: 'spinach raw', category: 'veg', basis: 'PER_100G', caloriesPer100: 23, proteinPer100: 2.9, carbsPer100: 3.6, fatPer100: 0.4 },
  { name: 'tomato', category: 'veg', basis: 'PER_100G', caloriesPer100: 18, proteinPer100: 0.9, carbsPer100: 3.9, fatPer100: 0.2 },
  { name: 'olive oil', category: 'fat', basis: 'PER_100ML', caloriesPer100: 884, proteinPer100: 0, carbsPer100: 0, fatPer100: 100 },
  { name: 'salmon fillet', category: 'protein', basis: 'PER_100G', caloriesPer100: 208, proteinPer100: 20, carbsPer100: 0, fatPer100: 13 },
  { name: 'tuna canned water', category: 'protein', basis: 'PER_100G', caloriesPer100: 116, proteinPer100: 26, carbsPer100: 0, fatPer100: 0.8 },
  { name: 'black beans cooked', category: 'legume', basis: 'PER_100G', caloriesPer100: 132, proteinPer100: 8.9, carbsPer100: 24, fatPer100: 0.5 },
  { name: 'sweet potato baked', category: 'veg', basis: 'PER_100G', caloriesPer100: 90, proteinPer100: 2, carbsPer100: 21, fatPer100: 0.1 },
  { name: 'banana', category: 'fruit', basis: 'PER_100G', caloriesPer100: 89, proteinPer100: 1.1, carbsPer100: 23, fatPer100: 0.3 },
  { name: 'apple', category: 'fruit', basis: 'PER_100G', caloriesPer100: 52, proteinPer100: 0.3, carbsPer100: 14, fatPer100: 0.2 },
  { name: 'almonds', category: 'fat', basis: 'PER_100G', caloriesPer100: 579, proteinPer100: 21, carbsPer100: 22, fatPer100: 50 },
  { name: 'cheddar cheese', category: 'dairy', basis: 'PER_100G', caloriesPer100: 402, proteinPer100: 23, carbsPer100: 1.3, fatPer100: 33 },
  { name: 'whole wheat bread', category: 'grain', basis: 'PER_100G', caloriesPer100: 247, proteinPer100: 13, carbsPer100: 41, fatPer100: 4.2 },
];

function buildIngredientRows(count: number) {
  const rows: typeof STAPLES = [];
  for (let i = 0; i < count; i++) {
    const base = STAPLES[i % STAPLES.length];
    const jitter = 1 + (i % 7) * 0.01;
    const name = i < STAPLES.length ? base.name : `${base.name} batch ${Math.floor(i / STAPLES.length)}`;
    rows.push({
      name,
      category: base.category,
      basis: base.basis,
      caloriesPer100: Math.round(base.caloriesPer100 * jitter * 10) / 10,
      proteinPer100: Math.round(base.proteinPer100 * jitter * 10) / 10,
      carbsPer100: Math.round(base.carbsPer100 * jitter * 10) / 10,
      fatPer100: Math.round(base.fatPer100 * jitter * 10) / 10,
    });
  }
  return rows;
}

function createPool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required for seed');
  return new Pool({ connectionString: url });
}

async function main() {
  const pool = createPool();
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const ingredientRows = buildIngredientRows(520);
  console.log(`Upserting ${ingredientRows.length} ingredients...`);

  for (const row of ingredientRows) {
    const nameNorm = normalizeIngredientName(row.name);
    await prisma.ingredient.upsert({
      where: { nameNorm },
      create: {
        name: row.name,
        nameNorm,
        category: row.category,
        basis: row.basis,
        caloriesPer100: row.caloriesPer100,
        proteinPer100: row.proteinPer100,
        carbsPer100: row.carbsPer100,
        fatPer100: row.fatPer100,
      },
      update: {
        caloriesPer100: row.caloriesPer100,
        proteinPer100: row.proteinPer100,
        carbsPer100: row.carbsPer100,
        fatPer100: row.fatPer100,
      },
    });
  }

  const allIngs = await prisma.ingredient.findMany({ select: { id: true, name: true } });
  const byNorm = new Map(allIngs.map((x) => [normalizeIngredientName(x.name), x]));

  console.log('Creating 520 recipes with ingredients...');
  for (let r = 0; r < 520; r++) {
    const title = `FitNexus catalog bowl ${r + 1}`;
    const existing = await prisma.recipe.findFirst({ where: { title } });
    if (existing) continue;

    const pick = (idx: number) => ingredientRows[(r + idx * 17) % ingredientRows.length];
    const lines = [pick(0), pick(1), pick(2), pick(3)];

    const recipe = await prisma.recipe.create({
      data: {
        title,
        servings: 2,
        source: 'seed',
        instructions: 'Combine ingredients; cook until done.',
        recipeIngredients: {
          create: lines.map((line, li) => {
            const norm = normalizeIngredientName(line.name);
            const ing = byNorm.get(norm);
            if (!ing) throw new Error(`Missing ingredient ${line.name}`);
            const amountG = line.basis === 'PER_100G' ? 80 + (r + li * 11) % 120 : null;
            const amountMl = line.basis === 'PER_100ML' ? 30 + (r + li) % 80 : null;
            return {
              ingredientId: ing.id,
              amountG,
              amountMl,
            };
          }),
        },
      },
    });

    let tCal = 0,
      tP = 0,
      tC = 0,
      tF = 0;
    lines.forEach((line, li) => {
      const norm = normalizeIngredientName(line.name);
      const ingRow = ingredientRows.find((x) => normalizeIngredientName(x.name) === norm);
      if (!ingRow) return;
      const qty =
        line.basis === 'PER_100G' ? 80 + (r + li * 11) % 120 : 30 + (r + li) % 80;
      const f = qty / 100;
      tCal += ingRow.caloriesPer100 * f;
      tP += ingRow.proteinPer100 * f;
      tC += ingRow.carbsPer100 * f;
      tF += ingRow.fatPer100 * f;
    });

    await prisma.nutritionFacts.create({
      data: {
        recipeId: recipe.id,
        calories: Math.round(tCal * 10) / 10,
        proteinG: Math.round(tP * 10) / 10,
        carbsG: Math.round(tC * 10) / 10,
        fatsG: Math.round(tF * 10) / 10,
        perServing: false,
      },
    });

    const dims = 64;
    const emb = Array.from({ length: dims }, (_, i) => Math.sin((r + 1) * 0.01 + i * 0.1) * 0.01);
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { embedding: emb },
    });
  }

  await prisma.$disconnect();
  await pool.end();
  console.log('Seed complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
