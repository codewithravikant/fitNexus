import { prisma } from '@/lib/prisma';
import { decodeHobbyContext } from '@/lib/hobby-context';
import type { AIContext } from '@/types/ai';

export async function buildAIContext(userId: string): Promise<AIContext> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [profile, habits, activities, meals, latestScore, privacy, todayHabit] = await Promise.all([
    prisma.healthProfile.findUnique({ where: { userId } }),
    prisma.habitLog.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'desc' },
      take: 14,
    }),
    prisma.activityLog.findMany({
      where: { userId, loggedAt: { gte: thirtyDaysAgo } },
      take: 40,
    }),
    prisma.mealLog.findMany({
      where: { userId, loggedAt: { gte: thirtyDaysAgo } },
      take: 40,
    }),
    prisma.wellnessScore.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.privacySettings.findUnique({ where: { userId } }),
    prisma.habitLog.findFirst({
      where: { userId, date: { gte: today } },
      orderBy: { date: 'desc' },
    }),
  ]);

  if (!profile) {
    throw new Error('Health profile required for AI context');
  }

  const hobby = decodeHobbyContext(profile.occupationType);

  const avgStress =
    habits.length > 0 ? habits.reduce((s, h) => s + h.stressLevel, 0) / habits.length : profile.baselineStressLevel;
  const avgSleep =
    habits.length > 0
      ? habits.reduce((s, h) => s + (h.sleepHours ?? 7), 0) / habits.length
      : 7;
  const avgHydration =
    habits.length > 0
      ? habits.reduce((s, h) => s + (h.hydrationLiters ?? 1.5), 0) / habits.length
      : 1.5;

  const activityTypes = [...new Set(activities.map((a) => a.activityType))];

  const allowAi = privacy?.allowAiDataUsage !== false;

  const ctx: AIContext = {
    profile: {
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      primaryGoal: profile.primaryGoal,
      selectedGoals: hobby.selectedGoals?.length ? hobby.selectedGoals : [profile.primaryGoal],
      goalStrategy: 'balanced_multi_goal',
      targetDirection: profile.targetDirection,
      dietaryPreference: profile.dietaryPreference,
      dietaryRestrictions: profile.dietaryRestrictions,
      fitnessLevel: profile.fitnessLevel,
      weeklyActivityFrequency: profile.weeklyActivityFrequency,
      exerciseTypes: profile.exerciseTypes,
      preferredEnvironment: profile.preferredEnvironment,
      timeOfDayPreference: profile.timeOfDayPreference,
      enduranceMinutes: profile.enduranceMinutes,
      hobbyName: hobby.hobbyName,
      hobbyActivityStyle: hobby.hobbyActivityStyle,
      baselineStressLevel: profile.baselineStressLevel,
    },
    recentHabits: {
      avgStress,
      avgSleep,
      avgHydration,
    },
    recentActivity: {
      totalMinutes: activities.reduce((s, a) => s + a.durationMin, 0),
      sessionCount: activities.length,
      types: activityTypes.slice(0, 8),
    },
    recentMeals: {
      count: meals.length,
      types: [...new Set(meals.map((m) => m.mealType))],
    },
    wellnessScore: latestScore?.score,
    preserveMode: todayHabit?.isRecoveryDay ?? false,
  };

  if (!allowAi) {
    ctx.recentObservation = undefined;
  }

  return ctx;
}
