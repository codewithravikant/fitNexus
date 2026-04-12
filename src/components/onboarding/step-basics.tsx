'use client';

import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WhyMicrocopy } from './why-microcopy';
import type { HealthProfileFormData } from '@/types/health';

interface StepBasicsProps {
  data: Partial<HealthProfileFormData>;
  onChange: (updates: Partial<HealthProfileFormData>) => void;
  errors: Record<string, string>;
}

export function StepBasics({ data, onChange, errors }: StepBasicsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Let&apos;s start with the basics</h2>
        <p className="text-sm text-muted-foreground mt-1">This helps FitNexus personalize your wellness plan</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Age" error={errors.age} required>
          <Input
            type="number"
            min={13}
            max={120}
            value={data.age || ''}
            onChange={(e) => onChange({ age: parseInt(e.target.value) || 0 })}
            placeholder="25"
          />
        </FormField>

        <FormField label="Gender" error={errors.gender} required>
          <Select value={data.gender || ''} onValueChange={(v) => onChange({ gender: v as HealthProfileFormData['gender'] })}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="NON_BINARY">Non-binary</SelectItem>
              <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Height (cm)" error={errors.heightCm} required>
          <Input
            type="number"
            min={100}
            max={250}
            value={data.heightCm || ''}
            onChange={(e) => onChange({ heightCm: parseFloat(e.target.value) || 0 })}
            placeholder="175"
          />
        </FormField>

        <FormField label="Weight (kg)" error={errors.weightKg} required>
          <Input
            type="number"
            min={30}
            max={300}
            step={0.1}
            value={data.weightKg || ''}
            onChange={(e) => onChange({ weightKg: parseFloat(e.target.value) || 0 })}
            placeholder="70"
          />
        </FormField>
      </div>

      <WhyMicrocopy text="Your physical measurements help us calculate BMI and tailor nutrition and activity recommendations to your body type." />
    </div>
  );
}
