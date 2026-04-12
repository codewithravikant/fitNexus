'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { activityLogSchema, type ActivityLogInput } from '@/lib/validations/logging';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface ActivityLogFormProps {
  onSuccess?: () => void;
}

export function ActivityLogForm({ onSuccess }: ActivityLogFormProps) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ActivityLogInput>({
    resolver: zodResolver(activityLogSchema),
  });

  const onSubmit = async (data: ActivityLogInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to log activity');
      toast({ title: 'Activity logged', variant: 'success' });
      onSuccess?.();
    } catch {
      toast({ title: 'Failed to log activity', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Activity Type" error={errors.activityType?.message} required>
        <Input {...register('activityType')} placeholder="e.g., Running, Yoga, Weight Training" />
      </FormField>
      <FormField label="Duration (minutes)" error={errors.durationMin?.message} required>
        <Input type="number" min={1} max={600} {...register('durationMin', { valueAsNumber: true })} placeholder="30" />
      </FormField>
      <FormField label="Intensity" error={errors.intensityLevel?.message}>
        <Select onValueChange={(v) => setValue('intensityLevel', v as ActivityLogInput['intensityLevel'])}>
          <SelectTrigger><SelectValue placeholder="Select intensity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MODERATE">Moderate</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Notes (optional)" error={errors.notes?.message}>
        <Input {...register('notes')} placeholder="How did it feel?" />
      </FormField>
      <Button type="submit" className="w-full" loading={loading}>
        Log Activity
      </Button>
    </form>
  );
}
