'use client';

import { useApi } from './use-api';
import type { DailyPlan } from '@/types/ai';

export function useDailyPlan() {
  return useApi<{ plan: DailyPlan | null }>('/api/daily-plan');
}
