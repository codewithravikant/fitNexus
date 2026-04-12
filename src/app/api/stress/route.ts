import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitMutation } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const { success } = rateLimitMutation(session.user.id, 'stress-log');
    if (!success) throw new ApiError(429, 'Too many requests');

    const { stressLevel } = await request.json();
    if (!stressLevel || stressLevel < 1 || stressLevel > 5) {
      throw new ApiError(400, 'Stress level must be between 1 and 5');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert today's habit log
    const existing = await prisma.habitLog.findFirst({
      where: { userId: session.user.id, date: { gte: today } },
    });

    let log;
    if (existing) {
      log = await prisma.habitLog.update({
        where: { id: existing.id },
        data: { stressLevel },
      });
    } else {
      log = await prisma.habitLog.create({
        data: { userId: session.user.id, stressLevel },
      });
    }

    return NextResponse.json(log);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const { preserveMode } = await request.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.habitLog.findFirst({
      where: { userId: session.user.id, date: { gte: today } },
    });

    let log;
    if (existing) {
      log = await prisma.habitLog.update({
        where: { id: existing.id },
        data: { isRecoveryDay: preserveMode },
      });
    } else {
      log = await prisma.habitLog.create({
        data: { userId: session.user.id, stressLevel: 3, isRecoveryDay: preserveMode },
      });
    }

    return NextResponse.json(log);
  } catch (error) {
    return handleApiError(error);
  }
}
