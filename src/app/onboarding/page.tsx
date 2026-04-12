import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import type { HealthProfileFormData } from '@/types/health';
import { decodeHobbyContext } from '@/lib/hobby-context';

export const metadata = { title: 'Onboarding - FitNexus' };

interface OnboardingPageProps {
  searchParams?: Promise<{ mode?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userRow = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!userRow) {
    redirect('/api/auth/signout?callbackUrl=/login');
  }

  const sp = searchParams ? await searchParams : undefined;
  const isRecalibrate = sp?.mode === 'recalibrate';

  const profile = await prisma.healthProfile.findUnique({
    where: { userId: session.user.id },
  });
  const hobbyContext = decodeHobbyContext(profile?.occupationType);

  if (profile?.onboardingCompleted && !isRecalibrate) redirect('/home');

  const initialData: Partial<HealthProfileFormData> | undefined = profile
    ? {
        age: profile.age,
        gender: profile.gender,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        primaryGoal: profile.primaryGoal,
        targetDirection: profile.targetDirection,
        targetWeightKg: profile.targetWeightKg ?? undefined,
        weeklyActivityFrequency: profile.weeklyActivityFrequency,
        exerciseTypes: profile.exerciseTypes,
        avgSessionDuration: profile.avgSessionDuration,
        fitnessLevel: profile.fitnessLevel,
        preferredEnvironment: profile.preferredEnvironment,
        timeOfDayPreference: profile.timeOfDayPreference,
        enduranceMinutes: profile.enduranceMinutes,
        pushupCount: profile.pushupCount ?? undefined,
        squatCount: profile.squatCount ?? undefined,
        hobbyName: hobbyContext.hobbyName,
        hobbyActivityStyle: hobbyContext.hobbyActivityStyle,
        dietaryPreference: profile.dietaryPreference,
        dietaryRestrictions: profile.dietaryRestrictions,
        baselineStressLevel: profile.baselineStressLevel,
        aiConsentGiven: profile.aiConsentGiven,
      }
    : undefined;

  return <OnboardingWizard mode={isRecalibrate ? 'recalibrate' : 'onboarding'} initialData={initialData} />;
}
