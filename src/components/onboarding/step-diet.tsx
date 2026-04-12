'use client';

import { WhyMicrocopy } from './why-microcopy';
import type { HealthProfileFormData } from '@/types/health';
import { cn } from '@/lib/utils';

interface StepDietProps {
  data: Partial<HealthProfileFormData>;
  onChange: (updates: Partial<HealthProfileFormData>) => void;
  errors: Record<string, string>;
}

const dietOptions = [
  { value: 'HIGH_PROTEIN', label: 'High Protein', icon: '🥩', desc: 'Prioritize protein-rich foods for muscle recovery and satiety' },
  { value: 'PLANT_BASED', label: 'Plant-Based', icon: '🥬', desc: 'Focus on vegetables, legumes, and whole grains' },
  { value: 'LOW_CARB', label: 'Low-Carb', icon: '🥑', desc: 'Reduce carbs, emphasize healthy fats and protein' },
  { value: 'BALANCED', label: 'Balanced', icon: '🍽️', desc: 'A well-rounded mix of all macronutrients' },
] as const;

const restrictionOptions = [
  'Gluten-free', 'Dairy-free', 'Nut-free', 'Vegetarian',
  'Vegan', 'Kosher', 'Halal', 'Low-sodium', 'Sugar-free', 'Diabetic-friendly',
];

export function StepDiet({ data, onChange, errors }: StepDietProps) {
  const toggleRestriction = (restriction: string) => {
    const current = data.dietaryRestrictions || [];
    const updated = current.includes(restriction)
      ? current.filter((r) => r !== restriction)
      : [...current, restriction];
    onChange({ dietaryRestrictions: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Diet preference</h2>
        <p className="text-sm text-muted-foreground mt-1">FitNexus will tailor your Smart Meal suggestions</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {dietOptions.map((diet) => (
          <button
            key={diet.value}
            type="button"
            onClick={() => onChange({ dietaryPreference: diet.value as HealthProfileFormData['dietaryPreference'] })}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all hover:border-primary/50',
              data.dietaryPreference === diet.value
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border'
            )}
          >
            <span className="text-3xl">{diet.icon}</span>
            <span className="text-sm font-medium">{diet.label}</span>
            <span className="text-xs text-muted-foreground">{diet.desc}</span>
          </button>
        ))}
      </div>
      {errors.dietaryPreference && <p className="text-xs text-destructive">{errors.dietaryPreference}</p>}

      <div className="space-y-2">
        <p className="text-sm font-medium">Dietary restrictions and food allergies (optional)</p>
        <div className="flex flex-wrap gap-2">
          {restrictionOptions.map((restriction) => (
            <button
              key={restriction}
              type="button"
              onClick={() => toggleRestriction(restriction)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs transition-all',
                (data.dietaryRestrictions || []).includes(restriction)
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {restriction}
            </button>
          ))}
        </div>
      </div>

      <WhyMicrocopy text="Your diet preference shapes the Smart Meal of the Day on your Home screen and recipe suggestions in the Intake tab." />
    </div>
  );
}
