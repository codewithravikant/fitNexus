'use client';

import { Utensils, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SmartMeal } from '@/types/ai';

interface NutritionCardProps {
  smartMeal: SmartMeal | null;
  dietaryPreference: string;
}

export function NutritionCard({ smartMeal, dietaryPreference }: NutritionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Nutrition</CardTitle>
          </div>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            {dietaryPreference.replace('_', ' ')}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {smartMeal ? (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Smart Meal of the Day</h4>
            <p className="font-semibold">{smartMeal.name}</p>
            <p className="text-sm text-muted-foreground">{smartMeal.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {smartMeal.prepTime}
              </span>
              {smartMeal.macroHighlights && (
                <span>{smartMeal.macroHighlights}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {smartMeal.dietaryTags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground">
                  <Tag className="h-2.5 w-2.5" /> {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your Smart Meal suggestion will appear here once FitNexus generates today&apos;s plan.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
