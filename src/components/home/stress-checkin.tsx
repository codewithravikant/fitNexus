'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface StressCheckinProps {
  currentStress?: number;
  preserveMode: boolean;
}

const stressEmoji = ['', '😌', '🙂', '😐', '😟', '😰'];

export function StressCheckin({ currentStress, preserveMode: initialPreserve }: StressCheckinProps) {
  const [stress, setStress] = useState(currentStress || 0);
  const [preserve, setPreserve] = useState(initialPreserve);
  const [submitting, setSubmitting] = useState(false);

  const handleStressSelect = async (level: number) => {
    setStress(level);
    try {
      setSubmitting(true);
      await fetch('/api/stress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stressLevel: level }),
      });
      toast({ title: 'Stress logged', variant: 'success' });
    } catch {
      toast({ title: 'Failed to log stress', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreserveToggle = async (checked: boolean) => {
    setPreserve(checked);
    try {
      await fetch('/api/stress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preserveMode: checked }),
      });
      toast({
        title: checked ? 'Preserve Mode ON' : 'Preserve Mode OFF',
        description: checked ? 'Actions adjusted for recovery' : 'Back to regular intensity',
        variant: 'success',
      });
    } catch {
      setPreserve(!checked);
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Stress &amp; Recovery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">How are you feeling right now?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleStressSelect(level)}
                disabled={submitting}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 rounded-lg border p-2 transition-all',
                  stress === level
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span className="text-lg">{stressEmoji[level]}</span>
                <span className="text-[10px] text-muted-foreground">{level}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
          <div className="flex items-center gap-2">
            <Shield className={cn('h-4 w-4', preserve ? 'text-primary' : 'text-muted-foreground')} />
            <div>
              <p className="text-sm font-medium">Preserve Mode</p>
              <p className="text-xs text-muted-foreground">Lower intensity for recovery</p>
            </div>
          </div>
          <Switch checked={preserve} onCheckedChange={handlePreserveToggle} />
        </div>
      </CardContent>
    </Card>
  );
}
