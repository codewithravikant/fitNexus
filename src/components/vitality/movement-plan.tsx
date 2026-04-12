'use client';

import { Dumbbell, Footprints, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MovementPlanProps {
  fitnessLevel: string;
  preferredEnvironment: string;
  preserveMode: boolean;
}

export function MovementPlan({ fitnessLevel, preferredEnvironment, preserveMode }: MovementPlanProps) {
  const getSuggestion = () => {
    if (preserveMode) {
      return {
        icon: Heart,
        title: 'Recovery Day',
        description: 'Light stretching or a gentle 15-minute walk. Listen to your body.',
        duration: '15-20 min',
      };
    }

    const suggestions: Record<string, { icon: typeof Dumbbell; title: string; description: string; duration: string }> = {
      BEGINNER: {
        icon: Footprints,
        title: 'Active Walk',
        description: `A brisk 20-minute walk ${preferredEnvironment === 'OUTDOORS' ? 'outside' : 'on the treadmill'}. Focus on steady pace.`,
        duration: '20 min',
      },
      INTERMEDIATE: {
        icon: Dumbbell,
        title: 'Mixed Training',
        description: `30-minute session combining cardio and bodyweight exercises. ${preferredEnvironment === 'GYM' ? 'Use machines for variety.' : 'No equipment needed.'}`,
        duration: '30 min',
      },
      ADVANCED: {
        icon: Dumbbell,
        title: 'Intense Training',
        description: `45-minute HIIT or strength session. ${preferredEnvironment === 'GYM' ? 'Focus on compound movements.' : 'Use progressive overload.'}`,
        duration: '45 min',
      },
    };

    return suggestions[fitnessLevel] || suggestions.INTERMEDIATE;
  };

  const suggestion = getSuggestion();
  const Icon = suggestion.icon;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Today&apos;s Movement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{suggestion.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{suggestion.description}</p>
            <p className="text-xs text-primary font-medium mt-1">{suggestion.duration}</p>
          </div>
        </div>
        {preserveMode && (
          <p className="mt-2 text-xs text-muted-foreground italic">
            Preserve Mode is active - focus on recovery today
          </p>
        )}
      </CardContent>
    </Card>
  );
}
