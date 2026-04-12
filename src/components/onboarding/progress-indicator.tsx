'use client';

import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Step {currentStep} of {totalSteps}</span>
        <span className="font-medium text-primary">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
