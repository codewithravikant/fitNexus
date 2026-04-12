'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { WellnessScoreData } from '@/types/health';

interface StepFitNexusRevealProps {
  wellnessScore: WellnessScoreData | null;
  onComplete: () => void;
  loading: boolean;
}

export function StepFitNexusReveal({ wellnessScore, onComplete, loading }: StepFitNexusRevealProps) {
  const score = wellnessScore?.score ?? 65;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Getting Started';
  };

  return (
    <div className="space-y-6 text-center">
      <div>
        <h2 className="text-xl font-semibold">Welcome to FitNexus</h2>
        <p className="text-sm text-muted-foreground mt-1">Your AI wellness coach is ready</p>
      </div>

      <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
        <svg className="absolute inset-0" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${(score / 100) * 440} 440`}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000"
            transform="rotate(-90 80 80)"
          />
        </svg>
        <div className="flex flex-col items-center">
          <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{Math.round(score)}</span>
          <span className="text-xs text-muted-foreground">{getScoreLabel(score)}</span>
        </div>
      </div>

      {wellnessScore && (
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {[
            { label: 'Habits', score: wellnessScore.habitsScore, weight: '40%' },
            { label: 'Activity', score: wellnessScore.activityScore, weight: '30%' },
            { label: 'Progress', score: wellnessScore.progressScore, weight: '20%' },
            { label: 'Metabolic', score: wellnessScore.metabolicScore, weight: '10%' },
          ].map((item) => (
            <Card key={item.label} className="p-3">
              <CardContent className="p-0 text-center">
                <p className="text-xs text-muted-foreground">{item.label} ({item.weight})</p>
                <p className="text-lg font-semibold">{Math.round(item.score)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-secondary/50">
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-semibold">Your first Top 3 Actions</h3>
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-medium">1</span>
              <span>Take a 20-minute walk today</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-medium">2</span>
              <span>Drink 8 glasses of water</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-medium">3</span>
              <span>5-minute breathing exercise before bed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" className="w-full" onClick={onComplete} loading={loading}>
        Go to Wellness Dashboard
      </Button>
    </div>
  );
}
