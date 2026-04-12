const buckets = new Map<string, { count: number; resetAt: number }>();

function hit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true as const };
  }
  if (b.count >= max) return { success: false as const };
  b.count += 1;
  return { success: true as const };
}

export function rateLimitStrict(userId: string, action: string) {
  return hit(`${action}:${userId}`, 20, 60_000);
}

export function rateLimitMutation(userId: string, action: string) {
  return hit(`${action}:${userId}`, 40, 60_000);
}

export function rateLimitByUser(userId: string, action: string, max: number, windowMs: number) {
  return hit(`${action}:${userId}`, max, windowMs);
}
