import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mealLogSchema } from '@/lib/validations/logging';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitMutation } from '@/lib/rate-limit';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const logs = await prisma.mealLog.findMany({
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

    const { success } = rateLimitMutation(session.user.id, 'meal-log');
    if (!success) throw new ApiError(429, 'Too many requests');

    const body = await request.json();
    const data = mealLogSchema.parse(body);

    const log = await prisma.mealLog.create({
      data: { ...data, userId: session.user.id },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
