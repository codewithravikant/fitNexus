'use client';

import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { WhyMicrocopy } from './why-microcopy';
import type { HealthProfileFormData } from '@/types/health';
import { cn } from '@/lib/utils';

interface StepStressProps {
  data: Partial<HealthProfileFormData>;
  onChange: (updates: Partial<HealthProfileFormData>) => void;
  errors: Record<string, string>;
}

const stressLabels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
const sleepLabels = ['Very Poor', 'Poor', 'Okay', 'Good', 'Excellent'];

export function StepStress({ data, onChange, errors }: StepStressProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Stress &amp; recovery baseline</h2>
        <p className="text-sm text-muted-foreground mt-1">This helps FitNexus adapt when you&apos;re under pressure</p>
      </div>

      <FormField label="Current stress level" error={errors.baselineStressLevel} required>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onChange({ baselineStressLevel: level })}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 rounded-xl border p-3 transition-all',
                data.baselineStressLevel === level
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className="text-lg font-semibold">{level}</span>
              <span className="text-[10px] text-muted-foreground">{stressLabels[level - 1]}</span>
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Sleep quality (optional)">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onChange({ sleepQuality: level })}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 rounded-xl border p-3 transition-all',
                data.sleepQuality === level
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className="text-lg font-semibold">{level}</span>
              <span className="text-[10px] text-muted-foreground">{sleepLabels[level - 1]}</span>
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Anything else we should know? (optional)" hint="e.g., recent life changes, health conditions">
        <Input
          value={data.stressNote || ''}
          onChange={(e) => onChange({ stressNote: e.target.value })}
          placeholder="I've been working long hours lately..."
        />
      </FormField>

      <FormField
        label="Data usage consent"
        required
        error={errors.aiConsentGiven}
        hint="FitNexus uses your onboarding inputs and logs to generate insights and recommendations. You can revoke consent later in settings."
      >
        <label className="flex items-start gap-3 rounded-xl border border-border p-4 hover:border-primary/50 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={!!data.aiConsentGiven}
            onChange={(e) => onChange({ aiConsentGiven: e.target.checked })}
            className="mt-1 h-4 w-4 accent-emerald-500"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium">I consent to my data being used to personalize AI recommendations</p>
            <p className="text-xs text-muted-foreground">
              This includes demographics, health metrics, habits, activity, and diet logs. No email/name is sent to the AI.
            </p>
          </div>
        </label>
      </FormField>

      <WhyMicrocopy text="Your stress baseline lets FitNexus activate Preserve Mode when needed, dialing back intensity and prioritizing recovery actions." />
    </div>
  );
}
