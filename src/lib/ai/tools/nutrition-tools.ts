import {
  calculateNutritionFromDb,
  calculateNutritionToolDefinition,
  parseCalculateNutritionArgs,
} from '@/lib/nutrition/calculate-nutrition';

export { calculateNutritionToolDefinition };

/** Execute tool call from OpenAI-compatible `tool_calls` payload. */
export async function handleCalculateNutritionToolCall(argsJson: string): Promise<string> {
  let raw: unknown;
  try {
    raw = JSON.parse(argsJson);
  } catch {
    return JSON.stringify({ error: 'Invalid JSON arguments' });
  }
  try {
    const input = parseCalculateNutritionArgs(raw);
    const result = await calculateNutritionFromDb(input);
    return JSON.stringify({
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fats: result.fats,
      totals: result.totals,
      servings: result.servings,
      unresolved: result.unresolved,
    });
  } catch (e) {
    return JSON.stringify({ error: (e as Error).message });
  }
}
