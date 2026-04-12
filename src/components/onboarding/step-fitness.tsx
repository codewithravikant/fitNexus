'use client';

import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WhyMicrocopy } from './why-microcopy';
import type { HealthProfileFormData } from '@/types/health';
import { cn } from '@/lib/utils';

interface StepFitnessProps {
  data: Partial<HealthProfileFormData>;
  onChange: (updates: Partial<HealthProfileFormData>) => void;
  errors: Record<string, string>;
}

const exerciseTypeOptions = [
  'Running', 'Walking', 'Cycling', 'Swimming', 'Yoga',
  'Weight Training', 'HIIT', 'Pilates', 'Sports', 'Dance',
];

export function StepFitness({ data, onChange, errors }: StepFitnessProps) {
  const toggleExerciseType = (type: string) => {
    const current = data.exerciseTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({ exerciseTypes: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Your fitness baseline</h2>
        <p className="text-sm text-muted-foreground mt-1">Help FitNexus understand your current activity level</p>
      </div>

      <FormField label={`Weekly activity: ${data.weeklyActivityFrequency || 0} days`} error={errors.weeklyActivityFrequency} required>
        <Slider
          min={0}
          max={7}
          step={1}
          value={[data.weeklyActivityFrequency || 0]}
          onValueChange={([v]) => onChange({ weeklyActivityFrequency: v })}
        />
      </FormField>

      <FormField label="Exercise types" error={errors.exerciseTypes} required>
        <div className="flex flex-wrap gap-2">
          {exerciseTypeOptions.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleExerciseType(type)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs transition-all',
                (data.exerciseTypes || []).includes(type)
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Session Duration" error={errors.avgSessionDuration} required>
          <Select value={data.avgSessionDuration || ''} onValueChange={(v) => onChange({ avgSessionDuration: v as HealthProfileFormData['avgSessionDuration'] })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SHORT">15-30 min</SelectItem>
              <SelectItem value="MEDIUM">30-60 min</SelectItem>
              <SelectItem value="LONG">60+ min</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Fitness Level" error={errors.fitnessLevel} required>
          <Select value={data.fitnessLevel || ''} onValueChange={(v) => onChange({ fitnessLevel: v as HealthProfileFormData['fitnessLevel'] })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Environment" error={errors.preferredEnvironment} required>
          <Select value={data.preferredEnvironment || ''} onValueChange={(v) => onChange({ preferredEnvironment: v as HealthProfileFormData['preferredEnvironment'] })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="HOME">Home</SelectItem>
              <SelectItem value="GYM">Gym</SelectItem>
              <SelectItem value="OUTDOORS">Outdoors</SelectItem>
              <SelectItem value="MIXED">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Preferred Time" error={errors.timeOfDayPreference} required>
          <Select value={data.timeOfDayPreference || ''} onValueChange={(v) => onChange({ timeOfDayPreference: v as HealthProfileFormData['timeOfDayPreference'] })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MORNING">Morning</SelectItem>
              <SelectItem value="AFTERNOON">Afternoon</SelectItem>
              <SelectItem value="EVENING">Evening</SelectItem>
              <SelectItem value="NO_PREFERENCE">No Preference</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Endurance (max minutes of sustained cardio)" error={errors.enduranceMinutes} required>
        <Input
          type="number"
          min={0}
          max={180}
          value={data.enduranceMinutes || ''}
          onChange={(e) => onChange({ enduranceMinutes: parseInt(e.target.value) || 0 })}
          placeholder="30"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Push-ups (max reps)" hint="Optional">
          <Input
            type="number"
            min={0}
            max={200}
            value={data.pushupCount || ''}
            onChange={(e) => onChange({ pushupCount: parseInt(e.target.value) || undefined })}
            placeholder="10"
          />
        </FormField>
        <FormField label="Squats (max reps)" hint="Optional">
          <Input
            type="number"
            min={0}
            max={200}
            value={data.squatCount || ''}
            onChange={(e) => onChange({ squatCount: parseInt(e.target.value) || undefined })}
            placeholder="15"
          />
        </FormField>
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <div>
          <h3 className="text-sm font-semibold">Hobby-based activity boost</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Tell us one hobby so AI can suggest realistic movement around your routine.
          </p>
        </div>
        <FormField label="Primary hobby" hint="Optional">
          <Input
            value={data.hobbyName || ''}
            onChange={(e) => onChange({ hobbyName: e.target.value })}
            placeholder="e.g. Photography, Reading, Gaming"
          />
        </FormField>
        <FormField label="Typical hobby activity style" hint="Optional">
          <Select
            value={data.hobbyActivityStyle || ''}
            onValueChange={(v) => onChange({ hobbyActivityStyle: v as HealthProfileFormData['hobbyActivityStyle'] })}
          >
            <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SEATED">Mostly seated</SelectItem>
              <SelectItem value="MIXED">Mixed movement</SelectItem>
              <SelectItem value="ACTIVE">Mostly active</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Connect your wearable soon to auto-sync steps, heart rate, and recovery insights.
        </p>
      </div>

      <WhyMicrocopy text="Your fitness baseline helps FitNexus calibrate exercise recommendations to your current ability, preventing injury and ensuring progress." />
    </div>
  );
}
