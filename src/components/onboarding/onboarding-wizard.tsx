'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressIndicator } from './progress-indicator';
import { StepBasics } from './step-basics';
import { StepGoals } from './step-goals';
import { StepFitness } from './step-fitness';
import { StepDiet } from './step-diet';
import { StepStress } from './step-stress';
import { StepFitNexusReveal } from './step-fitnexus-reveal';
import { healthProfileSchema } from '@/lib/validations/profile';
import { toast } from '@/hooks/use-toast';
import type { HealthProfileFormData } from '@/types/health';
import type { WellnessScoreData } from '@/types/health';

const TOTAL_STEPS = 6;

interface OnboardingWizardProps {
  mode?: 'onboarding' | 'recalibrate';
  initialData?: Partial<HealthProfileFormData>;
}

function normalizeWellnessScore(raw: unknown): WellnessScoreData | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, number | string | undefined>;
  const score = Number(data.score);
  const habitsScore = Number(data.habitsScore);
  const activityScore = Number(data.activityScore);
  const progressScore = Number(data.progressScore);
  const metabolicScore = Number(data.metabolicScore ?? data.bmiScore);
  const bmi = Number(data.bmi);
  const bmiCategory = String(data.bmiCategory ?? '');

  if (
    Number.isNaN(score) ||
    Number.isNaN(habitsScore) ||
    Number.isNaN(activityScore) ||
    Number.isNaN(progressScore) ||
    Number.isNaN(metabolicScore) ||
    Number.isNaN(bmi) ||
    !bmiCategory
  ) {
    return null;
  }

  return {
    score,
    habitsScore,
    activityScore,
    progressScore,
    metabolicScore,
    bmi,
    bmiCategory: bmiCategory as WellnessScoreData['bmiCategory'],
  };
}

export function OnboardingWizard({ mode = 'onboarding', initialData }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wellnessScore, setWellnessScore] = useState<WellnessScoreData | null>(null);
  const [data, setData] = useState<Partial<HealthProfileFormData>>({
    exerciseTypes: [],
    selectedGoals: initialData?.selectedGoals || (initialData?.primaryGoal ? [initialData.primaryGoal] : []),
    dietaryRestrictions: [],
    dietaryPreference: 'BALANCED',
    baselineStressLevel: 3,
    weeklyActivityFrequency: 3,
    aiConsentGiven: false,
    ...initialData,
  });

  const updateData = (updates: Partial<HealthProfileFormData>) => {
    setData((prev) => ({ ...prev, ...updates }));
    // Clear related errors
    const keys = Object.keys(updates);
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!data.age || data.age < 13) newErrors.age = 'Age must be at least 13';
      if (!data.gender) newErrors.gender = 'Please select a gender';
      if (!data.heightCm || data.heightCm < 100) newErrors.heightCm = 'Height must be at least 100cm';
      if (!data.weightKg || data.weightKg < 30) newErrors.weightKg = 'Weight must be at least 30kg';
    } else if (step === 2) {
      const selectedGoals = data.selectedGoals || (data.primaryGoal ? [data.primaryGoal] : []);
      if (selectedGoals.length < 1 || selectedGoals.length > 3) newErrors.selectedGoals = 'Please select 1 to 3 goals';
      if (!data.targetDirection) newErrors.targetDirection = 'Please select a direction';
    } else if (step === 3) {
      if (!data.exerciseTypes?.length) newErrors.exerciseTypes = 'Select at least one exercise type';
      if (!data.avgSessionDuration) newErrors.avgSessionDuration = 'Please select session duration';
      if (!data.fitnessLevel) newErrors.fitnessLevel = 'Please select fitness level';
      if (!data.preferredEnvironment) newErrors.preferredEnvironment = 'Please select environment';
      if (!data.timeOfDayPreference) newErrors.timeOfDayPreference = 'Please select time preference';
      if (!data.enduranceMinutes && data.enduranceMinutes !== 0) newErrors.enduranceMinutes = 'Please enter endurance minutes';
    } else if (step === 4) {
      if (!data.dietaryPreference) newErrors.dietaryPreference = 'Please select a diet preference';
    } else if (step === 5) {
      if (!data.baselineStressLevel) newErrors.baselineStressLevel = 'Please select your stress level';
      if (!data.aiConsentGiven) newErrors.aiConsentGiven = 'Please confirm how your data will be used';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (step === 5) {
      // Submit profile
      setLoading(true);
      try {
        const selectedGoals = data.selectedGoals || (data.primaryGoal ? [data.primaryGoal] : []);
        const payload = {
          ...data,
          selectedGoals,
          primaryGoal: selectedGoals[0],
        };
        const validated = healthProfileSchema.parse(payload);
        const res = await fetch('/api/profile', {
          method: mode === 'recalibrate' ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validated),
        });

        if (!res.ok) {
          const result = await res.json().catch(() => ({}));
          if (res.status === 401) {
            toast({
              title: 'Session expired',
              description: (result as { error?: string }).error ?? 'Signing you out…',
              variant: 'destructive',
            });
            await signOut({ callbackUrl: '/login' });
            return;
          }
          toast({
            title: 'Error',
            description: (result as { error?: string }).error ?? 'Request failed',
            variant: 'destructive',
          });
          return;
        }

        const result = await res.json();
        setWellnessScore(normalizeWellnessScore(result.wellnessScore));
        setStep(6);
      } catch {
        toast({ title: 'Error', description: 'Failed to save profile. Please try again.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleComplete = () => {
    router.push('/home');
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-lg space-y-8 pb-12 pt-8">
      <ProgressIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

      <Card className="border-primary/20 shadow-glow relative overflow-hidden bg-black/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <CardContent className="p-8 relative z-10">
          {step === 1 && <StepBasics data={data} onChange={updateData} errors={errors} />}
          {step === 2 && <StepGoals data={data} onChange={updateData} errors={errors} />}
          {step === 3 && <StepFitness data={data} onChange={updateData} errors={errors} />}
          {step === 4 && <StepDiet data={data} onChange={updateData} errors={errors} />}
          {step === 5 && <StepStress data={data} onChange={updateData} errors={errors} />}
          {step === 6 && (
            <StepFitNexusReveal
              wellnessScore={wellnessScore}
              onComplete={handleComplete}
              loading={false}
            />
          )}
        </CardContent>
      </Card>

      {step < 6 && (
        <div className="flex gap-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1 glass-panel border-primary/20 hover:bg-primary/10">
              Back
            </Button>
          )}
          <Button onClick={handleNext} loading={loading} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all">
            {step === 5 ? (mode === 'recalibrate' ? 'Re-calibrate Plan' : 'Complete Setup') : 'Continue'}
          </Button>
        </div>
      )}
    </div>
  );
}
