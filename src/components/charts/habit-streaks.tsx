'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';

interface HabitStreaksProps {
  data: Array<{ date: string; logged: boolean }>;
}

export function HabitStreaks({ data }: HabitStreaksProps) {
  // Calculate current streak
  let streak = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].logged) streak++;
    else break;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Daily Check-in Streak</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground">Consecutive check-in days</p>
          </div>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Streak is based on your daily check-ins, not Top 3 action checkboxes.
        </p>
        <div className="flex gap-1 flex-wrap">
          {data.slice(0, 30).map((d, i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-sm ${d.logged ? 'bg-primary' : 'bg-muted'}`}
              title={`${d.date}: ${d.logged ? 'Logged' : 'Missed'}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
