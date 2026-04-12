import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateDailyPlan } from '@/lib/ai/insight-generator';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitStrict } from '@/lib/rate-limit';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const insights = await prisma.aIInsight.findMany({
      where: {
        userId: session.user.id,
        modelUsed: { not: 'observation_summary_v1' },
      },
      orderBy: { generatedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(insights);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    // In-memory rate limit: prevent burst requests
    const { success } = rateLimitStrict(session.user.id, 'insight-gen');
    if (!success) throw new ApiError(429, 'Too many requests');

    // DB-backed rate limiting: max 3 generations per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await prisma.aIInsight.count({
      where: {
        userId: session.user.id,
        generatedAt: { gte: today },
        modelUsed: { not: 'observation_summary_v1' },
      },
    });

    if (todayCount >= 3) {
      throw new ApiError(429, 'Maximum 3 plan generations per day');
    }

    const body = await request.json().catch(() => ({}));
    const preserveMode = body.preserveMode ?? false;

    const plan = await generateDailyPlan(session.user.id, preserveMode);

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
