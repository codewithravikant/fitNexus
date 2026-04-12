import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { habitLogSchema } from '@/lib/validations/logging';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitMutation } from '@/lib/rate-limit';
import { recalculateAndStoreWellnessScore } from '@/lib/wellness-score';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const logs = await prisma.habitLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 30,
    });

    return NextResponse.json(logs);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const { success } = rateLimitMutation(session.user.id, 'habit-log');
    if (!success) throw new ApiError(429, 'Too many requests');

    const body = await request.json();
    const data = habitLogSchema.parse(body);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert for today
    const existing = await prisma.habitLog.findFirst({
      where: { userId: session.user.id, date: { gte: today } },
    });

    let log;
    if (existing) {
      log = await prisma.habitLog.update({
        where: { id: existing.id },
        data,
      });
    } else {
      log = await prisma.habitLog.create({
        data: { ...data, userId: session.user.id },
      });
    }

    await recalculateAndStoreWellnessScore(session.user.id);

    return NextResponse.json(log, { status: existing ? 200 : 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
