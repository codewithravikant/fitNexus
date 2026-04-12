import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const latest = await prisma.mealPlan.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return NextResponse.json({ mealPlan: latest });
  } catch (error) {
    return handleApiError(error);
  }
}
