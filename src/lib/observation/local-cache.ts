import type { ObservationSummaryStored } from './types';

const key = (userId: string) => `fitnexus:observation:${userId}`;

export async function readLocalObservation(
  userId: string
): Promise<ObservationSummaryStored | null> {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return null;
    return JSON.parse(raw) as ObservationSummaryStored;
  } catch {
    return null;
  }
}

export async function saveLocalObservation(userId: string, data: ObservationSummaryStored) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key(userId), JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}
