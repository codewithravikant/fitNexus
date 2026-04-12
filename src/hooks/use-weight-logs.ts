'use client';

import { useApi } from './use-api';
import type { WeightLogEntry } from '@/types/health';

export function useWeightLogs() {
  return useApi<WeightLogEntry[]>('/api/weight');
}
