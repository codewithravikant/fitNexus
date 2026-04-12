import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { healthProfileSchema } from '@/lib/validations/profile';
import { handleApiError, ApiError } from '@/lib/api-error';
import { rateLimitMutation } from '@/lib/rate-limit';
import { recalculateAndStoreWellnessScore } from '@/lib/wellness-score';
import { decodeHobbyContext, encodeHobbyContext } from '@/lib/hobby-context';
import { stripNullishForProfilePatch } from '@/lib/profile-patch';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const userRow = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (!userRow) {
      throw new ApiError(
        401,
        'Your session is out of date (no matching account). Sign out and sign in again.'
      );
    }

    const { success } = rateLimitMutation(session.user.id, 'profile-create');
    if (!success) throw new ApiError(429, 'Too many requests');

    const body = await request.json();
    const data = healthProfileSchema.parse(body);

    const existing = await prisma.healthProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (existing) throw new ApiError(409, 'Profile already exists');

    const {
      sleepQuality: _sleepQuality,
      stressNote: _stressNote,
      hobbyName: _hobbyName,
      hobbyActivityStyle: _hobbyActivityStyle,
      selectedGoals: _selectedGoals,
      ...profileData
    } = data;

    const hobbyContext = encodeHobbyContext({
      hobbyName: _hobbyName,
      hobbyActivityStyle: _hobbyActivityStyle,
      selectedGoals: _selectedGoals,
    });

    const profile = await prisma.healthProfile.create({
      data: {
        ...profileData,
        occupationType: hobbyContext ?? undefined,
        userId: session.user.id,
        onboardingCompleted: true,
      },
    });

    const wellnessScore = await recalculateAndStoreWellnessScore(session.user.id);

    // Create initial privacy settings
    await prisma.privacySettings.create({
      data: { userId: session.user.id },
    });

    // Create initial stress log
    if (_sleepQuality || _stressNote) {
      await prisma.habitLog.create({
        data: {
          userId: session.user.id,
          stressLevel: profile.baselineStressLevel,
          sleepQuality: _sleepQuality,
          notes: _stressNote,
        },
      });
    }

    return NextResponse.json({
      profile: {
        ...profile,
        ...decodeHobbyContext(profile.occupationType),
      },
      wellnessScore: {
        score: wellnessScore.score,
        habitsScore: wellnessScore.habitsScore,
        activityScore: wellnessScore.activityScore,
        progressScore: wellnessScore.progressScore,
        metabolicScore: wellnessScore.bmiScore,
        bmi: wellnessScore.bmi,
        bmiCategory: wellnessScore.bmiCategory,
      },
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const userRow = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (!userRow) {
      throw new ApiError(
        401,
        'Your session is out of date (no matching account). Sign out and sign in again.'
      );
    }

    const profile = await prisma.healthProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) throw new ApiError(404, 'Profile not found');
    const hobbyContext = decodeHobbyContext(profile.occupationType);
    return NextResponse.json({
      ...profile,
      ...hobbyContext,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError(401, 'Unauthorized');

    const userRow = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (!userRow) {
      throw new ApiError(
        401,
        'Your session is out of date (no matching account). Sign out and sign in again.'
      );
    }

    const body = await request.json();
    if (!body || typeof body !== 'object') {
      throw new ApiError(400, 'Invalid JSON body');
    }
    const cleaned = stripNullishForProfilePatch(body as Record<string, unknown>);
    const parsed = healthProfileSchema.partial().parse(cleaned);
    const {
      hobbyName,
      hobbyActivityStyle,
      selectedGoals,
      ...baseData
    } = parsed;

    const data: Record<string, unknown> = { ...baseData };
    const wantsHobbyUpdate = Object.prototype.hasOwnProperty.call(parsed, 'hobbyName')
      || Object.prototype.hasOwnProperty.call(parsed, 'hobbyActivityStyle')
      || Object.prototype.hasOwnProperty.call(parsed, 'selectedGoals');

    if (wantsHobbyUpdate) {
      const current = await prisma.healthProfile.findUnique({
        where: { userId: session.user.id },
        select: { occupationType: true },
      });
      const currentHobby = decodeHobbyContext(current?.occupationType);
      data.occupationType = encodeHobbyContext({
        hobbyName: Object.prototype.hasOwnProperty.call(parsed, 'hobbyName')
          ? hobbyName
          : currentHobby.hobbyName,
        hobbyActivityStyle: Object.prototype.hasOwnProperty.call(parsed, 'hobbyActivityStyle')
          ? hobbyActivityStyle
          : currentHobby.hobbyActivityStyle,
        selectedGoals: Object.prototype.hasOwnProperty.call(parsed, 'selectedGoals')
          ? selectedGoals
          : currentHobby.selectedGoals,
      });
    }

    if (Object.keys(data).length === 0) {
      const existing = await prisma.healthProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!existing) throw new ApiError(404, 'Profile not found');
      const wellnessScore = await recalculateAndStoreWellnessScore(session.user.id);
      return NextResponse.json({
        profile: {
          ...existing,
          ...decodeHobbyContext(existing.occupationType),
        },
        wellnessScore,
      });
    }

    const profile = await prisma.healthProfile.update({
      where: { userId: session.user.id },
      data: data as Parameters<typeof prisma.healthProfile.update>[0]['data'],
    });

    const wellnessScore = await recalculateAndStoreWellnessScore(session.user.id);
    return NextResponse.json({
      profile: {
        ...profile,
        ...decodeHobbyContext(profile.occupationType),
      },
      wellnessScore,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
