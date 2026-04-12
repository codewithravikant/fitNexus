'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { readLocalObservation, saveLocalObservation } from '@/lib/observation/local-cache';
import { Switch } from '@/components/ui/switch';
import { Brain, Droplets, Moon, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ObservationTrackerProps {
  userId: string;
  defaultFoodEntries: number;
  defaultActivityMinutes: number;
  defaultSleepHours: number;
  defaultStressLevel: number;
  defaultWaterLiters: number;
}

export function ObservationTracker({
  userId,
  defaultFoodEntries,
  defaultActivityMinutes,
  defaultSleepHours,
  defaultStressLevel,
  defaultWaterLiters,
}: ObservationTrackerProps) {
  const hydrationPresets = [0.5, 1, 1.5, 2, 2.5, 3];
  const [startedAt] = useState(Date.now());
  const [foodEntries, setFoodEntries] = useState(defaultFoodEntries);
  const [activityMinutes, setActivityMinutes] = useState(defaultActivityMinutes);
  const [sleepHours, setSleepHours] = useState(defaultSleepHours);
  const [stressLevel, setStressLevel] = useState(defaultStressLevel);
  const [waterLiters, setWaterLiters] = useState(defaultWaterLiters);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const appUsageMinutes = useMemo(
    () => Math.max(1, Math.round((Date.now() - startedAt) / (1000 * 60))),
    [startedAt]
  );

  useEffect(() => {
    readLocalObservation(userId).then((cached) => {
      if (!cached) return;
      setFoodEntries(cached.foodEntries);
      setActivityMinutes(cached.activityMinutes);
      setSleepHours(cached.sleepHours);
      setStressLevel(cached.stressLevel);
      setWaterLiters(cached.waterLiters);
    });
  }, [userId]);

  const saveObservation = async () => {
    const payload = {
      appUsageMinutes,
      foodEntries,
      waterLiters,
      sleepHours,
      stressLevel,
      activityMinutes,
      source: 'home-tracker' as const,
      capturedAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      await saveLocalObservation(userId, payload);
      const res = await fetch('/api/observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast({ title: 'Observation saved', description: 'Encrypted summary synced for better next-step planning.' });
    } catch {
      toast({
        title: 'Saved locally only',
        description: 'Could not sync to server. Your encrypted local cache is preserved.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm text-primary font-semibold tracking-wide uppercase font-heading">Observation Log</h3>
      <p className="text-xs text-muted-foreground">Encrypted summary for personalized AI planning and progress tracking.</p>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Droplets className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold tracking-tight">Hydration</span>
        </div>
        <div className="flex gap-1.5">
          {hydrationPresets.map((liters) => (
            <button
              key={liters}
              onClick={() => setWaterLiters(waterLiters === liters ? 0 : liters)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 rounded-lg border py-2 px-1 transition-all',
                waterLiters === liters
                  ? 'border-blue-400 bg-blue-400/10 shadow-sm'
                  : 'border-border/50 hover:border-blue-400/40'
              )}
            >
              <Droplets
                className={cn(
                  'h-3.5 w-3.5',
                  waterLiters === liters ? 'text-blue-400' : 'text-muted-foreground/50'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium',
                  waterLiters === liters ? 'text-blue-400' : 'text-muted-foreground'
                )}
              >
                {liters}L
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-muted-foreground space-y-1">
          <span className="inline-flex items-center gap-1"><Moon className="h-3 w-3" /> Sleep (hrs)</span>
          <Input type="number" step="0.5" min={0} max={24} value={sleepHours} onChange={(e) => setSleepHours(Number(e.target.value))} />
        </label>
        <label className="text-xs text-muted-foreground space-y-1">
          <span className="inline-flex items-center gap-1"><Brain className="h-3 w-3" /> Stress (1-5)</span>
          <Input type="number" min={1} max={5} value={stressLevel} onChange={(e) => setStressLevel(Number(e.target.value))} />
        </label>
        <label className="text-xs text-muted-foreground col-span-2 space-y-1">
          <span>Activity (min)</span>
          <Input type="number" min={0} max={600} value={activityMinutes} onChange={(e) => setActivityMinutes(Number(e.target.value))} />
        </label>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-dashed border-border/60 p-3">
        <div className="flex items-center gap-2.5">
          <Shield className={cn('h-4 w-4', recoveryMode ? 'text-primary' : 'text-muted-foreground/50')} />
          <div>
            <p className="text-sm font-medium">Recovery Mode</p>
            <p className="text-[10px] text-muted-foreground">Lower intensity for today</p>
          </div>
        </div>
        <Switch checked={recoveryMode} onCheckedChange={setRecoveryMode} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">Meals: {foodEntries} · App usage: {appUsageMinutes} min</p>
        <Button size="sm" onClick={saveObservation} loading={saving}>Save</Button>
      </div>
    </div>
  );
}
