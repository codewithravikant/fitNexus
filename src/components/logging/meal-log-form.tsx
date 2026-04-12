'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mealLogSchema, type MealLogInput } from '@/lib/validations/logging';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface MealLogFormProps {
  onSuccess?: () => void;
}

export function MealLogForm({ onSuccess }: MealLogFormProps) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MealLogInput>({
    resolver: zodResolver(mealLogSchema),
  });

  const onSubmit = async (data: MealLogInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to log meal');
      toast({ title: 'Meal logged', variant: 'success' });
      onSuccess?.();
    } catch {
      toast({ title: 'Failed to log meal', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Meal Type" error={errors.mealType?.message} required>
        <Select onValueChange={(v) => setValue('mealType', v as MealLogInput['mealType'])}>
          <SelectTrigger><SelectValue placeholder="Select meal type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="BREAKFAST">Breakfast</SelectItem>
            <SelectItem value="LUNCH">Lunch</SelectItem>
            <SelectItem value="DINNER">Dinner</SelectItem>
            <SelectItem value="SNACK">Snack</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Description" error={errors.description?.message}>
        <Input {...register('description')} placeholder="What did you eat?" />
      </FormField>
      <FormField label="Notes (optional)" error={errors.notes?.message}>
        <Input {...register('notes')} placeholder="e.g., Felt energized after" />
      </FormField>
      <Button type="submit" className="w-full" loading={loading}>
        Log Meal
      </Button>
    </form>
  );
}
