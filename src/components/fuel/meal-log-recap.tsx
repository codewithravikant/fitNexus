'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface MealLogRecapProps {
  meals: Array<{ mealType: string; description?: string; loggedAt: string }>;
}

const mealEmojis: Record<string, string> = {
  BREAKFAST: '🌅',
  LUNCH: '☀️',
  DINNER: '🌙',
  SNACK: '🍎',
};

export function MealLogRecap({ meals }: MealLogRecapProps) {
  if (meals.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Meals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No meals logged yet. Use the <strong>Log Meal</strong> button above to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Meals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {meals.slice(0, 7).map((meal, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2">
            <span className="text-lg">{mealEmojis[meal.mealType] || '🍽️'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{meal.mealType.charAt(0) + meal.mealType.slice(1).toLowerCase()}</p>
              {meal.description && <p className="text-xs text-muted-foreground truncate">{meal.description}</p>}
            </div>
            <span className="text-[10px] text-muted-foreground">{formatDate(meal.loggedAt, 'MMM d')}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
