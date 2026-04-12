'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { weightLogSchema, type WeightLogInput } from '@/lib/validations/logging';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { toast } from '@/hooks/use-toast';

interface WeightLogFormProps {
  onSuccess?: () => void;
  currentWeight?: number;
}

export function WeightLogForm({ onSuccess, currentWeight }: WeightLogFormProps) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<WeightLogInput>({
    resolver: zodResolver(weightLogSchema),
    defaultValues: { weightKg: currentWeight },
  });

  const onSubmit = async (data: WeightLogInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to log weight');
      toast({ title: 'Weight logged', variant: 'success' });
      onSuccess?.();
    } catch {
      toast({ title: 'Failed to log weight', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Weight (kg)" error={errors.weightKg?.message} required>
        <Input type="number" step={0.1} min={30} max={300} {...register('weightKg', { valueAsNumber: true })} />
      </FormField>
      <FormField label="Note (optional)" error={errors.note?.message}>
        <Input {...register('note')} placeholder="e.g., After morning workout" />
      </FormField>
      <Button type="submit" className="w-full" loading={loading}>
        Log Weight
      </Button>
    </form>
  );
}
