import type { PrimaryGoal } from '@prisma/client';

const PREFIX = 'hobbyctx:';

export interface HobbyContextPayload {
  hobbyName?: string;
  hobbyActivityStyle?: 'SEATED' | 'MIXED' | 'ACTIVE';
  selectedGoals?: PrimaryGoal[];
}

export function encodeHobbyContext(data: HobbyContextPayload): string | null {
  const has =
    data.hobbyName ||
    data.hobbyActivityStyle ||
    (data.selectedGoals && data.selectedGoals.length);
  if (!has) return null;
  return `${PREFIX}${JSON.stringify({
    hobbyName: data.hobbyName,
    hobbyActivityStyle: data.hobbyActivityStyle,
    selectedGoals: data.selectedGoals,
  })}`;
}

export function decodeHobbyContext(occupationType: string | null | undefined): HobbyContextPayload {
  if (!occupationType || !occupationType.startsWith(PREFIX)) {
    return {};
  }
  try {
    const parsed = JSON.parse(occupationType.slice(PREFIX.length)) as HobbyContextPayload;
    return parsed ?? {};
  } catch {
    return {};
  }
}
