import type { Gender, PrimaryGoal } from '@prisma/client';

/** Activity multiplier from weekly activity frequency (0–7 days). */
export function activityFactorFromWeeklyDays(days: number): number {
  const d = Math.max(0, Math.min(7, days));
  if (d <= 1) return 1.2;
  if (d <= 3) return 1.375;
  if (d <= 5) return 1.55;
  return 1.725;
}

/** Mifflin–St Jeor BMR (kcal/day). */
export function mifflinStJeorBmr(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const s = gender === 'FEMALE' ? -161 : 5;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + s;
}

export interface MacroTargets {
  calorieTarget: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
}

/**
 * Derive daily calorie target and macro grams from profile + goal.
 * Protein emphasis for muscle gain; moderate deficit for weight loss.
 */
export function deriveMacroTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  weeklyActivityDays: number,
  goal: PrimaryGoal,
  targetDirection: 'LOSE' | 'MAINTAIN' | 'IMPROVE_PERFORMANCE'
): MacroTargets {
  const bmr = mifflinStJeorBmr(weightKg, heightCm, age, gender);
  const af = activityFactorFromWeeklyDays(weeklyActivityDays);
  let tdee = bmr * af;

  if (targetDirection === 'LOSE' || goal === 'WEIGHT_LOSS') {
    tdee -= 400;
  } else if (goal === 'MUSCLE_GAIN') {
    tdee += 250;
  }

  tdee = Math.round(Math.max(1200, Math.min(5000, tdee)));

  let proteinG: number;
  if (goal === 'MUSCLE_GAIN') {
    proteinG = Math.round(weightKg * 2.0);
  } else if (goal === 'WEIGHT_LOSS') {
    proteinG = Math.round(weightKg * 1.8);
  } else {
    proteinG = Math.round(weightKg * 1.4);
  }

  const proteinKcal = proteinG * 4;
  const remaining = Math.max(0, tdee - proteinKcal);
  const fatsG = Math.round((remaining * 0.35) / 9);
  const carbsG = Math.round((remaining - fatsG * 9) / 4);

  return {
    calorieTarget: tdee,
    proteinG,
    carbsG: Math.max(0, carbsG),
    fatsG: Math.max(0, fatsG),
  };
}
