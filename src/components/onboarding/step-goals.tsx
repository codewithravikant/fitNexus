'use client';

import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { WhyMicrocopy } from './why-microcopy';
import type { HealthProfileFormData } from '@/types/health';
import { cn } from '@/lib/utils';

interface StepGoalsProps {
  data: Partial<HealthProfileFormData>;
  onChange: (updates: Partial<HealthProfileFormData>) => void;
  errors: Record<string, string>;
}

const goals = [
  { value: 'WEIGHT_LOSS', label: 'Weight Loss', icon: '⚖️', desc: 'Lose weight sustainably' },
  { value: 'MUSCLE_GAIN', label: 'Muscle Gain', icon: '💪', desc: 'Build strength and muscle' },
  { value: 'GENERAL_FITNESS', label: 'General Fitness', icon: '🏃', desc: 'Improve overall health' },
  { value: 'METABOLIC_HEALTH', label: 'Metabolic Health', icon: '❤️', desc: 'Optimize metabolism' },
  { value: 'MENTAL_FOCUS', label: 'Mental Focus', icon: '🧠', desc: 'Sharpen concentration' },
  { value: 'BURNOUT_PREVENTION', label: 'Burnout Prevention', icon: '🛡️', desc: 'Manage stress better' },
] as const;

const directions = [
  { value: 'LOSE', label: 'Lose / Reduce' },
  { value: 'MAINTAIN', label: 'Maintain Current' },
  { value: 'IMPROVE_PERFORMANCE', label: 'Improve Performance' },
] as const;

export function StepGoals({ data, onChange, errors }: StepGoalsProps) {
  const selectedGoals = data.selectedGoals || (data.primaryGoal ? [data.primaryGoal] : []);

  const toggleGoal = (goal: HealthProfileFormData['primaryGoal']) => {
    const exists = selectedGoals.includes(goal);
    let nextGoals = selectedGoals;
    if (exists) {
      nextGoals = selectedGoals.filter((g) => g !== goal);
    } else if (selectedGoals.length < 3) {
      nextGoals = [...selectedGoals, goal];
    } else {
      return;
    }

    onChange({
      selectedGoals: nextGoals,
      primaryGoal: nextGoals[0],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">What&apos;s your primary goal mix?</h2>
        <p className="text-sm text-muted-foreground mt-1">Pick 1 to 3 goals. This drives your daily Top 3 Actions.</p>
      </div>

      <p className="text-xs text-muted-foreground">
        Selected: <span className="font-semibold text-foreground">{selectedGoals.length}</span>/3
      </p>

      <div className="grid grid-cols-2 gap-3">
        {goals.map((goal) => (
          <button
            key={goal.value}
            type="button"
            onClick={() => toggleGoal(goal.value as HealthProfileFormData['primaryGoal'])}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl border p-4 text-center transition-all hover:border-primary/50',
              selectedGoals.includes(goal.value as HealthProfileFormData['primaryGoal'])
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border'
            )}
          >
            <span className="text-2xl">{goal.icon}</span>
            <span className="text-sm font-medium">{goal.label}</span>
            <span className="text-xs text-muted-foreground">{goal.desc}</span>
          </button>
        ))}
      </div>
      {errors.selectedGoals && <p className="text-xs text-destructive">{errors.selectedGoals}</p>}
      {errors.primaryGoal && <p className="text-xs text-destructive">{errors.primaryGoal}</p>}

      <FormField label="Target Direction" error={errors.targetDirection} required>
        <div className="flex gap-2">
          {directions.map((dir) => (
            <button
              key={dir.value}
              type="button"
              onClick={() => onChange({ targetDirection: dir.value as HealthProfileFormData['targetDirection'] })}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-sm transition-all',
                data.targetDirection === dir.value
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {dir.label}
            </button>
          ))}
        </div>
      </FormField>

      {data.targetDirection === 'LOSE' && (
        <FormField label="Target Weight (kg)" error={errors.targetWeightKg} hint="Optional - set a target to track progress">
          <Input
            type="number"
            min={30}
            max={300}
            step={0.1}
            value={data.targetWeightKg || ''}
            onChange={(e) => onChange({ targetWeightKg: parseFloat(e.target.value) || undefined })}
            placeholder="65"
          />
        </FormField>
      )}

      <WhyMicrocopy text="Your goal shapes every recommendation FitNexus gives you - from daily actions to nutrition suggestions and recovery advice." />
    </div>
  );
}
