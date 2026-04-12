'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Apple, Flame } from 'lucide-react';

interface NutritionOverviewProps {
  dietaryPreference: string;
}

export function NutritionOverview({ dietaryPreference }: NutritionOverviewProps) {
  const tips = {
    HIGH_PROTEIN: { focus: 'Prioritize lean proteins at every meal', targets: ['30g+ protein per meal', '2L water daily', 'Limit processed foods'] },
    PLANT_BASED: { focus: 'Ensure complete protein combinations', targets: ['Combine legumes + grains', 'B12-rich foods', 'Iron-rich greens'] },
    LOW_CARB: { focus: 'Focus on healthy fats and fiber', targets: ['Under 50g net carbs', 'Plenty of vegetables', 'Healthy fat sources'] },
    BALANCED: { focus: 'Aim for colorful, varied meals', targets: ['50% vegetables on plate', 'Moderate portions', 'Whole food sources'] },
  };

  const current = tips[dietaryPreference as keyof typeof tips] || tips.BALANCED;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Today&apos;s Nutrition Focus</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{current.focus}</p>
        <div className="grid grid-cols-3 gap-2">
          {current.targets.map((target, i) => {
            const icons = [Apple, Droplets, Flame];
            const Icon = icons[i];
            return (
              <div key={target} className="flex flex-col items-center gap-1 rounded-lg bg-secondary p-2 text-center">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground leading-tight">{target}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
