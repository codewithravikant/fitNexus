'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklySnapshotProps {
  completionRate: number;
  scoreDelta: number;
  currentScore: number;
}

export function WeeklySnapshot({ completionRate, scoreDelta, currentScore }: WeeklySnapshotProps) {
  const isPositive = scoreDelta >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Weekly Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-2xl font-bold text-primary">{Math.round(completionRate)}%</p>
            <p className="text-[10px] text-muted-foreground">Actions Done</p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-2xl font-bold">{Math.round(currentScore)}</p>
            <p className="text-[10px] text-muted-foreground">Wellness Score</p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={`text-2xl font-bold ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}{scoreDelta.toFixed(1)}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Score Delta</p>
          </div>
        </div>

        <Link
          href="/blueprint"
          className="flex items-center justify-center gap-1 text-sm text-primary hover:underline"
        >
          View Details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
