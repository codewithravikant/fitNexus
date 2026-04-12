import { z } from 'zod';

export const weightLogSchema = z.object({
  weightKg: z.number().positive(),
  note: z.string().optional(),
});

export type WeightLogInput = z.infer<typeof weightLogSchema>;

export const activityLogSchema = z.object({
  activityType: z.string().min(1),
  durationMin: z.number().int().positive(),
  intensityLevel: z.string().optional(),
  notes: z.string().optional(),
  isRecoveryDay: z.boolean().optional(),
});

export type ActivityLogInput = z.infer<typeof activityLogSchema>;

export const habitLogSchema = z.object({
  sleepHours: z.number().optional(),
  sleepQuality: z.number().optional(),
  hydrationLiters: z.number().optional(),
  stressLevel: z.number().int().min(1).max(10),
  moodLevel: z.number().optional(),
  isRecoveryDay: z.boolean().optional(),
  notes: z.string().optional(),
});

export type HabitLogInput = z.infer<typeof habitLogSchema>;

export const mealLogSchema = z.object({
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  description: z.string().optional(),
  photoUrl: z.string().optional(),
  notes: z.string().optional(),
});

export type MealLogInput = z.infer<typeof mealLogSchema>;

export const observationSummarySchema = z.object({
  appUsageMinutes: z.number(),
  foodEntries: z.number(),
  waterLiters: z.number(),
  sleepHours: z.number(),
  stressLevel: z.number(),
  activityMinutes: z.number(),
  source: z.string(),
  capturedAt: z.string().optional(),
});
