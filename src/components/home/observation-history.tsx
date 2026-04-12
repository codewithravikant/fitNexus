'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Activity, Brain, Droplets, Moon } from 'lucide-react';

interface HistoryEntryMeta {
  id: string;
  capturedAt: string;
  source: string;
}

interface ObservationDetails {
  appUsageMinutes: number;
  foodEntries: number;
  waterLiters: number;
  sleepHours: number;
  stressLevel: number;
  activityMinutes: number;
  source: 'home-tracker' | 'vitality-sync' | 'manual';
  capturedAt: string;
}

export function ObservationHistory() {
  const [history, setHistory] = useState<HistoryEntryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detailsMap, setDetailsMap] = useState<Record<string, ObservationDetails | null>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/observation')
      .then((res) => res.json())
      .then((data) => setHistory(Array.isArray(data.history) ? (data.history as HistoryEntryMeta[]) : []))
      .catch(() => toast({ title: 'Failed to load observation history', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  const toggleOpen = async (id: string) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }

    setOpenId(id);
    if (Object.prototype.hasOwnProperty.call(detailsMap, id)) return;

    setLoadingId(id);
    try {
      const res = await fetch(`/api/observation?id=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { observation?: ObservationDetails | null };
      setDetailsMap((prev) => ({ ...prev, [id]: data.observation || null }));
    } catch {
      setDetailsMap((prev) => ({ ...prev, [id]: null }));
      toast({ title: 'Failed to decrypt entry', variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm text-primary font-semibold tracking-wide uppercase font-heading">Observation History</h3>
      <p className="text-xs text-muted-foreground">Last 7 encrypted summaries. Entries decrypt only when opened.</p>

      {loading ? (
        <p className="text-xs text-muted-foreground">Loading history...</p>
      ) : history.length === 0 ? (
        <p className="text-xs text-muted-foreground">No observation summaries yet.</p>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => {
            const open = openId === entry.id;
            const details = detailsMap[entry.id];

            return (
              <div key={entry.id} className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {new Date(entry.capturedAt).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Source: {entry.source}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toggleOpen(entry.id)}>
                    {open ? 'Hide' : 'View'}
                  </Button>
                </div>

                {open && (
                  <div className="mt-2 border-t border-primary/10 pt-2 text-[11px] text-muted-foreground">
                    {loadingId === entry.id ? (
                      <p>Decrypting...</p>
                    ) : !details ? (
                      <p>No readable data for this entry.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-y-1 gap-x-3">
                        <p>App usage: {details.appUsageMinutes} min</p>
                        <p>Meals logged: {details.foodEntries}</p>
                        <p className="inline-flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-400" /> {details.waterLiters} L</p>
                        <p className="inline-flex items-center gap-1"><Moon className="h-3 w-3 text-primary" /> {details.sleepHours} h</p>
                        <p className="inline-flex items-center gap-1"><Brain className="h-3 w-3 text-primary" /> {details.stressLevel}/5</p>
                        <p className="inline-flex items-center gap-1"><Activity className="h-3 w-3 text-primary" /> {details.activityMinutes} min</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
