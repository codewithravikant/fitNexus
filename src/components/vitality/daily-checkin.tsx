'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Moon,
  Droplets,
  Brain,
  Smile,
  Shield,
  Check,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DailyCheckinProps {
  /** Today's existing habit log, if any */
  existing?: {
    sleepHours: number | null;
    sleepQuality: number | null;
    hydrationLiters: number | null;
    stressLevel: number;
    moodLevel: number | null;
    isRecoveryDay: boolean;
    notes: string | null;
  } | null;
}

/* ------------------------------------------------------------------ */
/*  Emoji / label maps                                                 */
/* ------------------------------------------------------------------ */

const stressEmojis = ['', '😌', '🙂', '😐', '😟', '😰'];
const stressLabels = ['', 'Calm', 'Good', 'Okay', 'Stressed', 'Very stressed'];

const moodEmojis = ['', '😢', '😕', '😐', '🙂', '😁'];
const moodLabels = ['', 'Low', 'Meh', 'Okay', 'Good', 'Great'];

const sleepQualityLabels = ['', 'Terrible', 'Poor', 'Fair', 'Good', 'Excellent'];

const hydrationPresets = [0.5, 1, 1.5, 2, 2.5, 3];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DailyCheckin({ existing }: DailyCheckinProps) {
  const router = useRouter();
  const isUpdate = !!existing;

  // Form state — pre-fill from today's existing log
  const [sleepHours, setSleepHours] = useState<number | null>(existing?.sleepHours ?? null);
  const [sleepQuality, setSleepQuality] = useState<number>(existing?.sleepQuality ?? 0);
  const [hydration, setHydration] = useState<number | null>(existing?.hydrationLiters ?? null);
  const [stress, setStress] = useState<number>(existing?.stressLevel ?? 0);
  const [mood, setMood] = useState<number>(existing?.moodLevel ?? 0);
  const [recovery, setRecovery] = useState(existing?.isRecoveryDay ?? false);
  const [submitting, setSubmitting] = useState(false);

  /* ---------- helpers ---------- */
  const canSubmit = stress > 0; // stress is the only required field

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        stressLevel: stress,
        isRecoveryDay: recovery,
      };
      if (sleepHours !== null) payload.sleepHours = sleepHours;
      if (sleepQuality > 0) payload.sleepQuality = sleepQuality;
      if (hydration !== null) payload.hydrationLiters = hydration;
      if (mood > 0) payload.moodLevel = mood;

      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed');

      toast({
        title: isUpdate ? 'Check-in updated' : 'Check-in saved',
        variant: 'success',
      });
      router.refresh();
    } catch {
      toast({ title: 'Failed to save check-in', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Daily Check-in</CardTitle>
          {isUpdate && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-primary">
              <Check className="h-3 w-3" /> Logged today
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* -------- Stress Level (required) -------- */}
        <Section icon={<Brain className="h-4 w-4" />} label="Stress Level" required>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setStress(level)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 rounded-lg border p-2 transition-all',
                  stress === level
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border/50 hover:border-primary/40'
                )}
              >
                <span className="text-base">{stressEmojis[level]}</span>
                <span className="text-[9px] text-muted-foreground leading-tight">
                  {stressLabels[level]}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* -------- Mood -------- */}
        <Section icon={<Smile className="h-4 w-4" />} label="Mood">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setMood(mood === level ? 0 : level)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 rounded-lg border p-2 transition-all',
                  mood === level
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border/50 hover:border-primary/40'
                )}
              >
                <span className="text-base">{moodEmojis[level]}</span>
                <span className="text-[9px] text-muted-foreground leading-tight">
                  {moodLabels[level]}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* -------- Sleep -------- */}
        <Section icon={<Moon className="h-4 w-4" />} label="Sleep">
          <div className="space-y-2">
            {/* Hours */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12">Hours</span>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={14}
                  step={0.5}
                  value={sleepHours ?? 0}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value) || null)}
                  className="flex-1 accent-primary h-1.5 cursor-pointer"
                />
                <span className="text-sm font-semibold tabular-nums w-10 text-right">
                  {sleepHours !== null ? `${sleepHours}h` : '--'}
                </span>
              </div>
            </div>

            {/* Quality */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12">Quality</span>
              <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4, 5].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSleepQuality(sleepQuality === q ? 0 : q)}
                    className={cn(
                      'flex-1 text-[10px] py-1 rounded-md border transition-all text-center',
                      sleepQuality === q
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border/50 text-muted-foreground hover:border-primary/40'
                    )}
                  >
                    {sleepQualityLabels[q]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* -------- Hydration -------- */}
        <Section icon={<Droplets className="h-4 w-4" />} label="Hydration">
          <div className="flex gap-1.5">
            {hydrationPresets.map((liters) => (
              <button
                key={liters}
                onClick={() => setHydration(hydration === liters ? null : liters)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 rounded-lg border py-2 px-1 transition-all',
                  hydration === liters
                    ? 'border-blue-400 bg-blue-400/10 shadow-sm'
                    : 'border-border/50 hover:border-blue-400/40'
                )}
              >
                <Droplets
                  className={cn(
                    'h-3.5 w-3.5',
                    hydration === liters ? 'text-blue-400' : 'text-muted-foreground/50'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    hydration === liters ? 'text-blue-400' : 'text-muted-foreground'
                  )}
                >
                  {liters}L
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* -------- Recovery Mode -------- */}
        <div className="flex items-center justify-between rounded-lg border border-dashed border-border/60 p-3">
          <div className="flex items-center gap-2.5">
            <Shield className={cn('h-4 w-4', recovery ? 'text-primary' : 'text-muted-foreground/50')} />
            <div>
              <p className="text-sm font-medium">Recovery Mode</p>
              <p className="text-[10px] text-muted-foreground">Lower intensity for today</p>
            </div>
          </div>
          <Switch checked={recovery} onCheckedChange={setRecovery} />
        </div>

        {/* -------- Submit -------- */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isUpdate ? (
            'Update Check-in'
          ) : (
            'Save Check-in'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({
  icon,
  label,
  required,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-primary">{icon}</span>
        <span className="text-xs font-semibold tracking-tight">{label}</span>
        {required && <span className="text-[9px] text-red-400">*</span>}
      </div>
      {children}
    </div>
  );
}
