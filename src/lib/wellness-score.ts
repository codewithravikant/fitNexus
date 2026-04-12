import { prisma } from '@/lib/prisma';
import { calculateBMI, getBMICategory } from '@/lib/calculations';

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export async function recalculateAndStoreWellnessScore(userId: string) {
  const profile = await prisma.healthProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('No profile');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [activities, habits, recentMeals] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId, loggedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.habitLog.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
    }),
    prisma.mealLog.findMany({
      where: { userId, loggedAt: { gte: sevenDaysAgo } },
      select: { id: true },
    }),
  ]);

  const bmi = calculateBMI(profile.heightCm, profile.weightKg);
  const expectedBmi =
    profile.heightCm > 0 ? profile.weightKg / Math.pow(profile.heightCm / 100, 2) : 0;
  if (Math.abs(bmi - expectedBmi) > 0.01) {
    throw new Error('BMI calculation mismatch detected');
  }
  const bmiCategory = getBMICategory(bmi);

  let bmiScore = 70;
  if (bmiCategory === 'Normal') bmiScore = 90;
  else if (bmiCategory === 'Overweight' || bmiCategory === 'Underweight') bmiScore = 65;
  else bmiScore = 45;

  const totalMin = activities.reduce((s, a) => s + a.durationMin, 0);
  const activityScore = clamp(40 + Math.min(40, totalMin / 30), 0, 100);

  const avgStress = habits.length
    ? habits.reduce((s, h) => s + h.stressLevel, 0) / habits.length
    : profile.baselineStressLevel;
  const habitsScore = clamp(100 - avgStress * 12, 0, 100);

  const goal = profile.primaryGoal;
  let progressScore = 72;
  if (goal === 'WEIGHT_LOSS') progressScore = bmi > 25 ? 68 : 78;
  if (goal === 'MUSCLE_GAIN') progressScore = 75;

  // Nutrition logging compliance (Phase 2 cross-system): light nudge when meals are tracked
  const mealCompliance = Math.min(1, recentMeals.length / 12);
  progressScore = clamp(progressScore + mealCompliance * 4, 0, 100);

  const score = Math.round(
    bmiScore * 0.25 + activityScore * 0.25 + habitsScore * 0.25 + progressScore * 0.25
  );

  const row = await prisma.wellnessScore.create({
    data: {
      userId,
      score,
      bmiScore,
      activityScore,
      progressScore,
      habitsScore,
      bmi,
      bmiCategory,
      weightKg: profile.weightKg,
    },
  });

  return row;
}
