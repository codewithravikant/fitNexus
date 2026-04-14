import type { AIContext } from '@/types/ai';

/** Stored on AIInsight rows for daily plans */
export const DAILY_PROMPT_VERSION = 'daily-plan-v3';

export function buildDailyPlanPrompt(context: AIContext, preserveMode: boolean): string {
  const p = context.profile;
  const pm = preserveMode || context.preserveMode;
  return `You are a supportive wellness coach. Create ONE daily plan as strict JSON only (no markdown).

User context:
- Age ${p.age}, ${p.gender}, goal: ${p.primaryGoal}, direction: ${p.targetDirection}
- Diet: ${p.dietaryPreference}, restrictions: ${p.dietaryRestrictions.join(', ') || 'none'}
- Fitness: ${p.fitnessLevel}, weekly activity days: ${p.weeklyActivityFrequency}
- Stress baseline ${p.baselineStressLevel}/5; recent avg stress ${context.recentHabits.avgStress.toFixed(1)}/5
- Recent activity: ${context.recentActivity.totalMinutes} min over ${context.recentActivity.sessionCount} sessions
- Wellness score (if any): ${context.wellnessScore ?? 'n/a'}

Preserve / recovery mode: ${pm ? 'YES — favor gentle movement, shorter efforts, nervous-system regulation.' : 'NO — standard intensity ok.'}

Return JSON with this shape:
{
  "insightText": "2-3 sentences, warm and specific to their goals.",
  "insightExpanded": "optional longer paragraph or empty string",
  "actions": [
    {"id":"a1","title":"","description":"","category":"movement|nutrition|mindfulness","completed":false},
    {"id":"a2","title":"","description":"","category":"movement|nutrition|mindfulness","completed":false},
    {"id":"a3","title":"","description":"","category":"movement|nutrition|mindfulness","completed":false}
  ],
  "smartMeal": {
    "name": "",
    "description": "",
    "prepTime": "",
    "ingredients": ["..."],
    "macroHighlights": "",
    "dietaryTags": ["..."]
  }
}

Rules: exactly 3 actions; categories must be one each if possible; respect dietary restrictions; keep titles under 80 chars.`;
}

export const WEEKLY_PROMPT_VERSION = 'weekly-summary-v2';

/** Back-compat alias for daily plan prompt version */
export const PROMPT_VERSION = DAILY_PROMPT_VERSION;

export function buildWeeklySummaryPrompt(
  context: AIContext & {
    weeklyStats: { completionRate: number; avgScore: number };
    nutritionHint?: string | null;
  }
): string {
  const p = context.profile;
  const nut =
    context.nutritionHint?.trim() ||
    'No structured meal-plan summary on file — encourage logging meals and generating a plan in Intake.';
  return `You are a wellness coach. Respond with JSON only.

User: goal ${p.primaryGoal}, diet ${p.dietaryPreference}, stress baseline ${p.baselineStressLevel}.
Weekly stats: plan action completion about ${context.weeklyStats.completionRate}%, avg wellness score ${context.weeklyStats.avgScore.toFixed(0)}.
Nutrition / meal planning: ${nut}

Return:
{
  "summary": "3-5 sentences reflecting the week",
  "weeklyFocus": "short theme for next week (max 80 chars)",
  "highlights": ["optional bullet as string"]
}`;
}
