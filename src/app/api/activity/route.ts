import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { activityLogSchema } from '@/lib/validations/logging';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitMutation } from '@/lib/rate-limit';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const logs = await prisma.activityLog.findMany({
      where: { userId: session.user.id },
      orderBy: { loggedAt: 'desc' },
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

    const { success } = rateLimitMutation(session.user.id, 'activity-log');
    if (!success) throw new ApiError(429, 'Too many requests');

    const body = await request.json();
    const data = activityLogSchema.parse(body);

    // ─── Duplicate Prevention ───────────────────────────────────────
    // Reject identical activity logs within a 5-minute window
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicate = await prisma.activityLog.findFirst({
      where: {
        userId: session.user.id,
        activityType: data.activityType,
        durationMin: data.durationMin,
        loggedAt: { gte: fiveMinAgo },
      },
    });

    if (duplicate) {
      throw new ApiError(409, 'Duplicate activity detected. Same activity was logged within the last 5 minutes.');
    }

    const log = await prisma.activityLog.create({
      data: { ...data, userId: session.user.id },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
