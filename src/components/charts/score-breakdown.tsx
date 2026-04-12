'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ScoreBreakdownProps {
  habits: number;
  activity: number;
  progress: number;
  metabolic: number;
}

export function ScoreBreakdown({ habits, activity, progress, metabolic }: ScoreBreakdownProps) {
  const items = [
    { label: 'Habits', score: habits, weight: '40%', color: 'bg-emerald-500' },
    { label: 'Activity', score: activity, weight: '30%', color: 'bg-blue-500' },
    { label: 'Progress', score: progress, weight: '20%', color: 'bg-purple-500' },
    { label: 'Metabolic Health', score: metabolic, weight: '10%', color: 'bg-orange-500' },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{item.label} <span className="text-xs text-muted-foreground">({item.weight})</span></span>
              <span className="font-medium">{Math.round(item.score)}</span>
            </div>
            <Progress value={item.score} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
