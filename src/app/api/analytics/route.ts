import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateBMI, getBMICategory } from '@/lib/calculations';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const userId = session.user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [profile, wellnessScores, weightLogs, activityLogs, habitLogs, prevActivityLogs, prevHabitLogs] = await Promise.all([
      prisma.healthProfile.findUnique({ where: { userId } }),
      prisma.wellnessScore.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 90 }),
      prisma.weightLog.findMany({ where: { userId }, orderBy: { loggedAt: 'desc' }, take: 90 }),
      prisma.activityLog.findMany({ where: { userId, loggedAt: { gte: thirtyDaysAgo } } }),
      prisma.habitLog.findMany({ where: { userId, date: { gte: thirtyDaysAgo } } }),
      prisma.activityLog.findMany({ where: { userId, loggedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.habitLog.findMany({ where: { userId, date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    ]);

    if (!profile) throw new ApiError(404, 'Profile not found');

    const bmi = calculateBMI(profile.weightKg, profile.heightCm);
    const bmiCategory = getBMICategory(bmi);

    const currentActivityMinutes = (activityLogs as Array<{ durationMin: number }>).reduce(
      (sum: number, a: { durationMin: number }) => sum + a.durationMin,
      0
    );
    const prevActivityMinutes = (prevActivityLogs as Array<{ durationMin: number }>).reduce(
      (sum: number, a: { durationMin: number }) => sum + a.durationMin,
      0
    );

    const currentAvgStress = habitLogs.length
      ? (habitLogs as Array<{ stressLevel: number }>).reduce(
        (sum: number, h: { stressLevel: number }) => sum + h.stressLevel,
        0
      ) / habitLogs.length
      : 3;
    const prevAvgStress = prevHabitLogs.length
      ? (prevHabitLogs as Array<{ stressLevel: number }>).reduce(
        (sum: number, h: { stressLevel: number }) => sum + h.stressLevel,
        0
      ) / prevHabitLogs.length
      : 3;

    return NextResponse.json({
      bmi: { value: bmi, category: bmiCategory },
      wellnessScores: (wellnessScores as Array<{
        date: Date;
        score: number;
        habitsScore: number;
        activityScore: number;
        progressScore: number;
        bmiScore: number;
      }>).map((s) => ({
        date: s.date,
        score: s.score,
        habitsScore: s.habitsScore,
        activityScore: s.activityScore,
        progressScore: s.progressScore,
        metabolicScore: s.bmiScore,
      })),
      weightTrend: (weightLogs as Array<{ loggedAt: Date; weightKg: number }>).map((w) => ({ date: w.loggedAt, weight: w.weightKg })),
      activity: {
        current: { totalMinutes: currentActivityMinutes, sessions: activityLogs.length },
        previous: { totalMinutes: prevActivityMinutes, sessions: prevActivityLogs.length },
      },
      habits: {
        currentAvgStress,
        previousAvgStress: prevAvgStress,
        totalLogs: habitLogs.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
