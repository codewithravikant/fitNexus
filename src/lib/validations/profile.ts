import { z } from 'zod';

const gender = z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']);
const primaryGoal = z.enum([
  'WEIGHT_LOSS',
  'MUSCLE_GAIN',
  'GENERAL_FITNESS',
  'METABOLIC_HEALTH',
  'MENTAL_FOCUS',
  'BURNOUT_PREVENTION',
]);
const targetDirection = z.enum(['LOSE', 'MAINTAIN', 'IMPROVE_PERFORMANCE']);
const dietaryPreference = z.enum(['HIGH_PROTEIN', 'PLANT_BASED', 'LOW_CARB', 'BALANCED']);
const fitnessLevel = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
const exerciseEnvironment = z.enum(['HOME', 'GYM', 'OUTDOORS', 'MIXED']);
const timeOfDay = z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'NO_PREFERENCE']);
const sessionDuration = z.enum(['SHORT', 'MEDIUM', 'LONG']);

export const healthProfileSchema = z.object({
  age: z.number().int().min(13).max(120),
  gender,
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  primaryGoal,
  selectedGoals: z.array(primaryGoal).optional(),
  targetDirection,
  targetWeightKg: z.number().optional(),
  weeklyActivityFrequency: z.number().int().min(0),
  exerciseTypes: z.array(z.string()),
  avgSessionDuration: sessionDuration,
  fitnessLevel,
  preferredEnvironment: exerciseEnvironment,
  timeOfDayPreference: timeOfDay,
  enduranceMinutes: z.number().int().min(0),
  pushupCount: z.number().int().optional(),
  squatCount: z.number().int().optional(),
  hobbyName: z.string().optional(),
  hobbyActivityStyle: z.enum(['SEATED', 'MIXED', 'ACTIVE']).optional(),
  dietaryPreference,
  dietaryRestrictions: z.array(z.string()),
  baselineStressLevel: z.number().int().min(1).max(10),
  sleepQuality: z.number().optional(),
  stressNote: z.string().optional(),
  aiConsentGiven: z.boolean(),
  /** IANA timezone for meal timing / summaries */
  timezone: z.string().max(100).optional(),
});

export const privacySettingsSchema = z.object({
  allowAiDataUsage: z.boolean().optional(),
  allowAnonymizedSharing: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  weeklyEmailSummary: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});
