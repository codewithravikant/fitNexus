/**
 * Phase 2 data standardization: grams (g), milliliters (ml), kilocalories (kcal),
 * minutes, ISO 8601 timestamps for nutrition APIs and persistence.
 */

export type MassUnit = 'g';
export type VolumeUnit = 'ml';
export type NutritionUnit = MassUnit | VolumeUnit;

export interface IngredientQuantity {
  name: string;
  quantity: number;
  unit: NutritionUnit;
}

/** Normalize ingredient name for DB lookup (lowercase, trim, collapse spaces). */
export function normalizeIngredientName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Ensure numeric quantity is positive and finite. */
export function assertPositiveQuantity(q: number, label = 'quantity'): void {
  if (!Number.isFinite(q) || q <= 0) {
    throw new Error(`${label} must be a positive finite number`);
  }
}

/** Convert a Date to ISO 8601 string (UTC). */
export function toIso8601(d: Date): string {
  return d.toISOString();
}

/** Parse ISO 8601; throws if invalid. */
export function parseIso8601(s: string): Date {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid ISO 8601 date');
  return d;
}

/** Minutes as integer >= 0 (activity, prep time). */
export function clampMinutes(m: number): number {
  if (!Number.isFinite(m) || m < 0) return 0;
  return Math.round(m);
}

/** Kilocalories: non-negative float. */
export function clampKcal(k: number): number {
  if (!Number.isFinite(k) || k < 0) return 0;
  return Math.round(k * 10) / 10;
}

/** Macro grams: non-negative. */
export function clampMacroG(g: number): number {
  if (!Number.isFinite(g) || g < 0) return 0;
  return Math.round(g * 10) / 10;
}
