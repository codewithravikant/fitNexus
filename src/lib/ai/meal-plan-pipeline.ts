import 'server-only';

import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { prisma } from '@/lib/prisma';
import { getOpenAI, hasOpenAIKey, MODEL } from '@/lib/ai/openai-client';
import { deriveMacroTargets } from '@/lib/nutrition/tdee';
import { retrieveSimilarRecipes } from '@/lib/nutrition/rag';
import { embedTextOrFallback } from '@/lib/ai/embeddings';
import { calculateNutritionToolDefinition, handleCalculateNutritionToolCall } from '@/lib/ai/tools/nutrition-tools';
import type { MealType } from '@prisma/client';

const PIPELINE_VERSION = 'meal_plan_v2';

function parseMealSlot(s: unknown): MealType {
  const u = String(s ?? 'LUNCH').toUpperCase();
  if (u === 'BREAKFAST' || u === 'LUNCH' || u === 'DINNER' || u === 'SNACK') return u;
  return 'LUNCH';
}

export interface MealPlanResult {
  mealPlanId: string;
  strategy: Record<string, unknown>;
  schedule: Record<string, unknown>;
  plan: Record<string, unknown>;
  fallbackUsed: boolean;
  modelUsed: string;
}

function startEndToday(timezone: string) {
  try {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = fmt.formatToParts(now);
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    if (!y || !m || !d) throw new Error('date');
    const start = new Date(`${y}-${m}-${d}T00:00:00`);
    const end = new Date(`${y}-${m}-${d}T23:59:59`);
    return { start, end };
  } catch {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
}

async function callJsonModel(system: string, user: string): Promise<Record<string, unknown>> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.4,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Empty AI response');
  return JSON.parse(content) as Record<string, unknown>;
}

async function runToolLoop(
  system: string,
  user: string,
  maxRounds = 6
): Promise<{ text: string; modelUsed: string }> {
  const openai = getOpenAI();
  const tools: ChatCompletionTool[] = [calculateNutritionToolDefinition];
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  let rounds = 0;
  while (rounds < maxRounds) {
    rounds++;
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.35,
      max_tokens: 2500,
    });
    const msg = completion.choices[0]?.message;
    if (!msg) throw new Error('No message');
    messages.push(msg);

    const calls = msg.tool_calls;
    if (calls?.length) {
      for (const tc of calls) {
        if (tc.type !== 'function') continue;
        const name = tc.function.name;
        const args = tc.function.arguments || '{}';
        let result = '{}';
        if (name === 'calculate_nutrition') {
          result = await handleCalculateNutritionToolCall(args);
        }
        messages.push({ role: 'tool', tool_call_id: tc.id, content: result });
      }
      continue;
    }

    const text = msg.content || '';
    return { text, modelUsed: MODEL };
  }

  return { text: '{"meals":[]}', modelUsed: MODEL };
}

function buildFallbackPlan(
  targets: ReturnType<typeof deriveMacroTargets>,
  rag: Awaited<ReturnType<typeof retrieveSimilarRecipes>>
): Record<string, unknown> {
  const meals = ['BREAKFAST', 'LUNCH', 'DINNER'].map((slot, i) => ({
    slot,
    title: rag[i]?.title ?? `Balanced ${slot.toLowerCase()}`,
    recipeId: rag[i]?.id ?? null,
    calories: Math.round(targets.calorieTarget / 3),
    proteinG: Math.round(targets.proteinG / 3),
    carbsG: Math.round(targets.carbsG / 3),
    fatsG: Math.round(targets.fatsG / 3),
  }));
  return {
    meals,
    note:
      'Offline-safe plan from your targets and catalog matches. Add OPENROUTER_API_KEY (optional: OPENROUTER_MODEL) or OPENAI_API_KEY for AI-generated meals with tool-validated nutrition.',
  };
}

export async function generateMealPlanForUser(userId: string): Promise<MealPlanResult> {
  const profile = await prisma.healthProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Health profile required');

  const privacy = await prisma.privacySettings.findUnique({ where: { userId } });
  if (privacy && !privacy.allowAiDataUsage) {
    throw new Error('AI meal planning is disabled in privacy settings');
  }

  const tz = profile.timezone || 'UTC';
  const { start, end } = startEndToday(tz);

  const targets = deriveMacroTargets(
    profile.weightKg,
    profile.heightCm,
    profile.age,
    profile.gender,
    profile.weeklyActivityFrequency,
    profile.primaryGoal,
    profile.targetDirection
  );

  const q = `${profile.primaryGoal} ${profile.dietaryPreference} ${profile.dietaryRestrictions.join(' ')}`;
  const emb = await embedTextOrFallback(q);
  const rag = await retrieveSimilarRecipes(emb, 6);

  const strategyFallback = {
    calorieTarget: targets.calorieTarget,
    proteinG: targets.proteinG,
    carbsG: targets.carbsG,
    fatsG: targets.fatsG,
    dietaryNotes: profile.dietaryRestrictions,
    ragTitles: rag.map((r) => r.title),
  };

  if (!hasOpenAIKey()) {
    const plan = buildFallbackPlan(targets, rag);
    const row = await prisma.mealPlan.create({
      data: {
        userId,
        startDate: start,
        endDate: end,
        calorieTarget: targets.calorieTarget,
        proteinTargetG: targets.proteinG,
        carbsTargetG: targets.carbsG,
        fatsTargetG: targets.fatsG,
        mealsPerDay: 3,
        strategyJson: strategyFallback,
        scheduleJson: { mealsPerDay: 3, slots: ['BREAKFAST', 'LUNCH', 'DINNER'] },
        planJson: JSON.parse(JSON.stringify(plan)) as object,
        promptVersion: PIPELINE_VERSION,
        modelUsed: 'fallback_catalog_v1',
        fallbackUsed: true,
        items: {
          create: (plan.meals as Record<string, unknown>[]).map((m) => ({
            dayIndex: 0,
            slot: parseMealSlot(m.slot),
            title: String(m.title),
            recipeId: (m.recipeId as string | null) || null,
            calories: Number(m.calories) || null,
            proteinG: Number(m.proteinG) || null,
            carbsG: Number(m.carbsG) || null,
            fatsG: Number(m.fatsG) || null,
          })),
        },
      },
    });
    return {
      mealPlanId: row.id,
      strategy: strategyFallback,
      schedule: { mealsPerDay: 3 },
      plan,
      fallbackUsed: true,
      modelUsed: 'fallback_catalog_v1',
    };
  }

  let strategy: Record<string, unknown>;
  let schedule: Record<string, unknown>;
  let plan: Record<string, unknown>;
  let modelUsed = MODEL;
  let usedFallback = false;

  try {
    const sys1 =
      'You are a nutrition strategist. Output strict JSON only. Use targets as guidance; respect dietary restrictions.';
    const user1 = JSON.stringify({
      profile: {
        age: profile.age,
        gender: profile.gender,
        goal: profile.primaryGoal,
        activityDays: profile.weeklyActivityFrequency,
        restrictions: profile.dietaryRestrictions,
        preference: profile.dietaryPreference,
      },
      serverTargets: targets,
      ragRecipes: rag,
    });
    strategy = await callJsonModel(sys1, user1);

    const sys2 =
      'You are a meal scheduler. For ONE day, split serverTargets into meals (breakfast, lunch, dinner, optional snack). JSON only.';
    const user2 = JSON.stringify({ strategy, serverTargets: targets, mealsPerDay: 3 });
    schedule = await callJsonModel(sys2, user2);

    const sys3 = `You are a recipe writer. For each meal in the schedule, propose realistic ingredient lines using ONLY ingredient names that could exist in a food database (short plain English). You MUST call calculate_nutrition for each meal's ingredients with correct g/ml. After tools, output final JSON: { "meals": [ { "slot", "title", "ingredients": [{ "name", "quantity", "unit": "g"|"ml" }], "servings": number, "nutrition": { "calories", "protein", "carbs", "fats" } } ] } using ONLY tool-computed nutrition values.`;
    const user3 = JSON.stringify({ schedule, serverTargets: targets, ragRecipes: rag });

    const { text: step3text, modelUsed: m3 } = await runToolLoop(sys3, user3);
    modelUsed = m3;
    try {
      plan = JSON.parse(step3text) as Record<string, unknown>;
    } catch {
      plan = buildFallbackPlan(targets, rag);
      usedFallback = true;
    }
  } catch (e) {
    console.error('[meal-plan-pipeline]', e);
    strategy = strategyFallback;
    schedule = { mealsPerDay: 3, slots: ['BREAKFAST', 'LUNCH', 'DINNER'] };
    plan = buildFallbackPlan(targets, rag);
    modelUsed = 'fallback_catalog_v1';
    usedFallback = true;
  }

  const row = await prisma.mealPlan.create({
    data: {
      userId,
      startDate: start,
      endDate: end,
      calorieTarget: targets.calorieTarget,
      proteinTargetG: targets.proteinG,
      carbsTargetG: targets.carbsG,
      fatsTargetG: targets.fatsG,
      mealsPerDay: 3,
      strategyJson: JSON.parse(JSON.stringify(strategy)) as object,
      scheduleJson: JSON.parse(JSON.stringify(schedule)) as object,
      planJson: JSON.parse(JSON.stringify(plan)) as object,
      promptVersion: PIPELINE_VERSION,
      modelUsed,
      fallbackUsed: usedFallback,
      items: {
          create: Array.isArray(plan.meals)
          ? (plan.meals as Record<string, unknown>[]).map((m, idx) => ({
              dayIndex: 0,
              slot: parseMealSlot(m.slot),
              title: String(m.title || `Meal ${idx + 1}`),
              recipeId: null,
              calories: typeof m.nutrition === 'object' && m.nutrition
                ? Number((m.nutrition as Record<string, unknown>).calories)
                : null,
              proteinG:
                typeof m.nutrition === 'object' && m.nutrition
                  ? Number((m.nutrition as Record<string, unknown>).protein)
                  : null,
              carbsG:
                typeof m.nutrition === 'object' && m.nutrition
                  ? Number((m.nutrition as Record<string, unknown>).carbs)
                  : null,
              fatsG:
                typeof m.nutrition === 'object' && m.nutrition
                  ? Number((m.nutrition as Record<string, unknown>).fats)
                  : null,
            }))
          : [],
      },
    },
  });

  return {
    mealPlanId: row.id,
    strategy,
    schedule,
    plan,
    fallbackUsed: usedFallback,
    modelUsed,
  };
}
