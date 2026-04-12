'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';

interface GeneratePlanButtonProps {
  hasExistingPlan?: boolean;
}

export function GeneratePlanButton({ hasExistingPlan = false }: GeneratePlanButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preserveMode: false }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate plan');
      }

      // Reload the page to show the new AI-generated plan
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const Icon = hasExistingPlan ? RefreshCw : Sparkles;
  const label = hasExistingPlan ? 'Regenerate Plan' : 'Generate My AI Plan';

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all disabled:opacity-50 ${
          hasExistingPlan
            ? 'border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating your plan...
          </>
        ) : (
          <>
            <Icon className="h-4 w-4" />
            {label}
          </>
        )}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
