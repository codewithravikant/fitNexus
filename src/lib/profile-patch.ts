/**
 * Prepares a client PATCH body for /api/profile: removes null/undefined and NaN
 * so Zod partial() does not treat them as explicit updates (null fails z.number()).
 * JSON.stringify also serializes NaN as null.
 */
export function stripNullishForProfilePatch(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'number' && Number.isNaN(value)) continue;
    out[key] = value;
  }
  return out;
}

/** Avoid NaN in React state from empty number inputs (JSON would send null and fail Zod). */
export function parseIntOrOmit(raw: string): number | undefined {
  const t = raw.trim();
  if (t === '') return undefined;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function parseFloatOrOmit(raw: string): number | undefined {
  const t = raw.trim();
  if (t === '') return undefined;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : undefined;
}
