'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

type MealPlanJson = {
  meals?: Array<{
    slot?: string;
    title?: string;
    nutrition?: { calories?: number; protein?: number; carbs?: number; fats?: number };
  }>;
  note?: string;
};

export function MealPlanPanel({
  initialPlan,
}: {
  initialPlan: { planJson: unknown; fallbackUsed: boolean; createdAt: string } | null;
}) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(initialPlan);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/meal-plans/generate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      toast({ title: 'Meal plan ready', description: 'Your AI meal plan was saved.', variant: 'success' });
      setPlan({
        planJson: data.plan,
        fallbackUsed: data.fallbackUsed,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      toast({
        title: 'Could not generate',
        description: (e as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const pj = plan?.planJson as MealPlanJson | undefined;
  const meals = pj?.meals ?? [];

  return (
    <Card className="border-primary/15">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Today&apos;s meal plan
          </CardTitle>
          <CardDescription>
            3-step AI pipeline with tool-validated nutrition. Uses your TDEE targets and catalog RAG.
          </CardDescription>
        </div>
        <Button size="sm" onClick={generate} disabled={loading} className="shrink-0 gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Generate
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {plan?.fallbackUsed ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Fallback or offline catalog was used (add API key for full AI + tools).
          </p>
        ) : null}
        {pj?.note ? <p className="text-xs text-muted-foreground">{pj.note}</p> : null}
        {meals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No meals yet — tap Generate.</p>
        ) : (
          <ul className="space-y-2">
            {meals.map((m, i) => (
              <li
                key={i}
                className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm"
              >
                <div className="font-medium">{m.title ?? 'Meal'}</div>
                <div className="text-xs text-muted-foreground capitalize">{m.slot ?? ''}</div>
                {m.nutrition ? (
                  <div className="text-xs mt-1 font-mono">
                    {Math.round(m.nutrition.calories ?? 0)} kcal · P{m.nutrition.protein ?? 0} · C
                    {m.nutrition.carbs ?? 0} · F{m.nutrition.fats ?? 0}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
