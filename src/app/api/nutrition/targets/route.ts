import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deriveMacroTargets } from '@/lib/nutrition/tdee';
import { handleApiError, ApiError } from '@/lib/api-error';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const profile = await prisma.healthProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) throw new ApiError(404, 'Profile not found');

    const targets = deriveMacroTargets(
      profile.weightKg,
      profile.heightCm,
      profile.age,
      profile.gender,
      profile.weeklyActivityFrequency,
      profile.primaryGoal,
      profile.targetDirection
    );

    return NextResponse.json({
      timezone: profile.timezone,
      ...targets,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
