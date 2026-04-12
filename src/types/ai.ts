export interface DailyAction {
  id: string;
  title: string;
  description: string;
  category: 'movement' | 'nutrition' | 'mindfulness';
  completed: boolean;
  completedAt?: string;
  preserveModeAlternative?: string;
}

export interface SmartMeal {
  name: string;
  description: string;
  prepTime: string;
  ingredients: string[];
  macroHighlights?: string;
  dietaryTags: string[];
}

export interface DailyPlan {
  id: string;
  date: string;
  actions: DailyAction[];
  smartMeal: SmartMeal;
  insightText: string;
  insightExpanded?: string;
  preserveMode: boolean;
  fallbackUsed: boolean;
}

export interface AIInsightData {
  id: string;
  generatedAt: string;
  insightText: string;
  recommendations: DailyAction[];
  weeklyFocus?: string;
  fallbackUsed: boolean;
}

export interface AIContext {
  profile: {
    age: number;
    gender: string;
    heightCm: number;
    weightKg: number;
    primaryGoal: string;
    selectedGoals: string[];
    goalStrategy: 'single_focus' | 'balanced_multi_goal';
    targetDirection: string;
    dietaryPreference: string;
    dietaryRestrictions: string[];
    fitnessLevel: string;
    weeklyActivityFrequency: number;
    exerciseTypes: string[];
    preferredEnvironment: string;
    timeOfDayPreference: string;
    enduranceMinutes: number;
    hobbyName?: string;
    hobbyActivityStyle?: 'SEATED' | 'MIXED' | 'ACTIVE';
    baselineStressLevel: number;
  };
  recentHabits: {
    avgStress: number;
    avgSleep: number;
    avgHydration: number;
  };
  recentActivity: {
    totalMinutes: number;
    sessionCount: number;
    types: string[];
  };
  recentMeals: {
    count: number;
    types: string[];
  };
  recentObservation?: {
    avgAppUsageMinutes: number;
    avgWaterLiters: number;
    avgSleepHours: number;
    avgStressLevel: number;
    avgActivityMinutes: number;
  };
  wellnessScore?: number;
  preserveMode: boolean;
}

export interface RecipeData {
  id: string;
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty?: 'Easy' | 'Moderate' | 'Advanced';
  ingredients: string[];
  instructions: string[];
  dietaryTags: string[];
  foodFact?: string;
  cookVideoTitle?: string;
  cookVideoUrl?: string;
  cookVideoDuration?: string;
  imageUrl?: string;
}
