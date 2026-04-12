import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

type WeightLogRow = Awaited<ReturnType<typeof prisma.weightLog.findMany>>[number];
type ActivityLogRow = Awaited<ReturnType<typeof prisma.activityLog.findMany>>[number];
type HabitLogRow = Awaited<ReturnType<typeof prisma.habitLog.findMany>>[number];
type MealLogRow = Awaited<ReturnType<typeof prisma.mealLog.findMany>>[number];
type WellnessScoreRow = Awaited<ReturnType<typeof prisma.wellnessScore.findMany>>[number];

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const format = request.nextUrl.searchParams.get('format') || 'json';
    const userId = session.user.id;

    const [profile, wellnessScores, weightLogs, activityLogs, habitLogs, mealLogs] = await Promise.all([
      prisma.healthProfile.findUnique({ where: { userId } }),
      prisma.wellnessScore.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.weightLog.findMany({ where: { userId }, orderBy: { loggedAt: 'desc' } }),
      prisma.activityLog.findMany({ where: { userId }, orderBy: { loggedAt: 'desc' } }),
      prisma.habitLog.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.mealLog.findMany({ where: { userId }, orderBy: { loggedAt: 'desc' } }),
    ]);

    if (format === 'csv') {
      const csvEscape = (val: string) => `"${val.replace(/"/g, '""')}"`;
      const lines = ['type,date,value,notes'];

      weightLogs.forEach((w: WeightLogRow) =>
        lines.push(`weight,${w.loggedAt.toISOString()},${w.weightKg},${csvEscape(w.note || '')}`)
      );
      activityLogs.forEach((a: ActivityLogRow) =>
        lines.push(`activity,${a.loggedAt.toISOString()},${a.durationMin},${csvEscape(a.activityType)}`)
      );
      habitLogs.forEach((h: HabitLogRow) =>
        lines.push(`habit,${h.date.toISOString()},${h.stressLevel},${csvEscape(`sleep:${h.sleepHours || ''}`)}`)
      );
      mealLogs.forEach((m: MealLogRow) =>
        lines.push(`meal,${m.loggedAt.toISOString()},${csvEscape(m.mealType)},${csvEscape(m.description || '')}`)
      );
      wellnessScores.forEach((s: WellnessScoreRow) =>
        lines.push(`score,${s.date.toISOString()},${s.score},${csvEscape(`bmi:${s.bmi.toFixed(1)}`)}`)
      );

      return new NextResponse(lines.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="fitnexus-export.csv"',
        },
      });
    }

    const data = {
      exportedAt: new Date().toISOString(),
      profile,
      wellnessScores,
      weightLogs,
      activityLogs,
      habitLogs,
      mealLogs,
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="fitnexus-export.json"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
