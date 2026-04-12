'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WellnessGaugeProps {
  score: number;
}

export function WellnessGauge({ score }: WellnessGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 60;
  const dashOffset = circumference - (clampedScore / 100) * circumference * 0.75; // 270 degrees

  const getColor = (s: number) => {
    if (s >= 80) return '#059669';
    if (s >= 60) return '#eab308';
    if (s >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-base text-center">Wellness Score</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-4">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-[135deg]">
            <circle cx="70" cy="70" r="60" fill="none" stroke="var(--muted)" strokeWidth="10" strokeDasharray={`${circumference * 0.75} ${circumference}`} strokeLinecap="round" />
            <circle cx="70" cy="70" r="60" fill="none" stroke={getColor(clampedScore)} strokeWidth="10" strokeDasharray={`${circumference * 0.75} ${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{Math.round(clampedScore)}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
