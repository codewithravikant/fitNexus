import type {
  Gender,
  PrimaryGoal,
  TargetDirection,
  DietaryPreference,
  FitnessLevel,
  ExerciseEnvironment,
  TimeOfDayPreference,
  SessionDuration,
  MealType,
} from '@prisma/client';

export interface HealthProfileFormData {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  primaryGoal: PrimaryGoal;
  selectedGoals?: PrimaryGoal[];
  targetDirection: TargetDirection;
  targetWeightKg?: number;
  weeklyActivityFrequency: number;
  exerciseTypes: string[];
  avgSessionDuration: SessionDuration;
  fitnessLevel: FitnessLevel;
  preferredEnvironment: ExerciseEnvironment;
  timeOfDayPreference: TimeOfDayPreference;
  enduranceMinutes: number;
  pushupCount?: number;
  squatCount?: number;
  hobbyName?: string;
  hobbyActivityStyle?: 'SEATED' | 'MIXED' | 'ACTIVE';
  dietaryPreference: DietaryPreference;
  dietaryRestrictions: string[];
  baselineStressLevel: number;
  sleepQuality?: number;
  stressNote?: string;
  aiConsentGiven: boolean;
}

export type BMICategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese';

export interface WellnessScoreData {
  score: number;
  habitsScore: number;
  activityScore: number;
  progressScore: number;
  metabolicScore: number;
  bmi: number;
  bmiCategory: BMICategory;
}

export interface WeightLogEntry {
  id: string;
  weightKg: number;
  note?: string;
  loggedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  activityType: string;
  durationMin: number;
  intensityLevel?: string;
  notes?: string;
  isRecoveryDay: boolean;
  loggedAt: string;
}

export interface HabitLogEntry {
  id: string;
  date: string;
  sleepHours?: number;
  sleepQuality?: number;
  hydrationLiters?: number;
  stressLevel: number;
  moodLevel?: number;
  isRecoveryDay: boolean;
  notes?: string;
}

export interface MealLogEntry {
  id: string;
  mealType: MealType;
  description?: string;
  photoUrl?: string;
  notes?: string;
  loggedAt: string;
}
