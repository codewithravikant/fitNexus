import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { weightLogSchema } from '@/lib/validations/logging';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitMutation } from '@/lib/rate-limit';
import { recalculateAndStoreWellnessScore } from '@/lib/wellness-score';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const logs = await prisma.weightLog.findMany({
      where: { userId: session.user.id },
      orderBy: { loggedAt: 'desc' },
      take: 90,
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

    const { success } = rateLimitMutation(session.user.id, 'weight-log');
    if (!success) throw new ApiError(429, 'Too many requests');

    const body = await request.json();
    const data = weightLogSchema.parse(body);

    const log = await prisma.weightLog.create({
      data: { ...data, userId: session.user.id },
    });

    // Update profile weight
    await prisma.healthProfile.update({
      where: { userId: session.user.id },
      data: { weightKg: data.weightKg },
    });

    await recalculateAndStoreWellnessScore(session.user.id);

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
