'use client';

import { useEffect, useState } from 'react';
import { Check, Circle, Dumbbell, Leaf, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import type { DailyAction } from '@/types/ai';

interface TopActionsProps {
  actions: DailyAction[];
  planId: string;
}

const categoryIcons = {
  movement: Dumbbell,
  nutrition: Leaf,
  mindfulness: Brain,
};

export function TopActions({ actions: initial, planId }: TopActionsProps) {
  const [actions, setActions] = useState(initial);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setActions(initial);
  }, [initial]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const toggleAction = async (actionId: string) => {
    if (pendingActionId) return;
    const action = actions.find((a) => a.id === actionId);
    if (!action) return;
    if (action.completed) {
      toast({ title: 'Already done', description: 'Completed actions stay locked for today.' });
      return;
    }

    const updated = actions.map((a) =>
      a.id === actionId
        ? { ...a, completed: true, completedAt: new Date().toISOString() }
        : a
    );
    setActions(updated);
    setPendingActionId(actionId);

    try {
      const res = await fetch('/api/daily-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, actionId, completed: true }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'Failed to update');
      }
    } catch {
      setActions(actions); // revert
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally {
      setPendingActionId(null);
    }
  };

  const completedCount = actions.filter((a) => a.completed).length;

  return (
    <div className="h-full relative">
      <div className="flex items-center justify-between gap-3 pb-3">
        <h3 className="text-sm text-emerald-400/90 font-medium tracking-wide uppercase">Today&apos;s Top 3 Actions</h3>
        <div className="flex gap-1.5 items-center bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shrink-0">
          <span className="text-xs font-bold text-emerald-400">{completedCount}/3</span>
          <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">Done</span>
        </div>
      </div>
      <div className="space-y-3">
        <AnimatePresence>
          {actions.map((action, i) => {
            const Icon = categoryIcons[action.category];
            return (
              <motion.button
                key={action.id}
                onClick={() => toggleAction(action.id)}
                disabled={pendingActionId === action.id}
                layout
                whileHover={{ scale: 1.01, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all duration-300 relative overflow-hidden group',
                  action.completed
                    ? 'border-emerald-500/40 bg-emerald-500/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]'
                    : 'border-white/5 bg-black/40 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:shadow-glow'
                )}
              >
                {/* Active glow background */}
                {action.completed && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-50 pointer-events-none" />
                )}

                <div className="mt-1 relative z-10">
                  {action.completed ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      className="bg-emerald-400 rounded-full p-0.5 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                    >
                      <Check className="h-4 w-4 text-black" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <Circle className="h-5 w-5 text-emerald-500/40 group-hover:text-emerald-400 transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", action.completed ? "text-emerald-400" : "text-emerald-600/60")}>#{i + 1}</span>
                    <Icon className={cn("h-3 w-3", action.completed ? "text-emerald-400" : "text-muted-foreground")} />
                  </div>
                  <div className="relative inline-block">
                    <p className={cn(
                      'text-sm font-semibold transition-colors duration-300',
                      action.completed ? 'text-emerald-100/50' : 'text-emerald-50'
                    )}>
                      {action.title}
                    </p>
                    {/* Animated Strikethrough */}
                    <motion.div
                      className="absolute top-1/2 left-0 h-0.5 bg-emerald-500/50 rounded-full"
                      initial={{ width: action.completed ? '100%' : '0%' }}
                      animate={{ width: action.completed ? '100%' : '0%' }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      style={{ marginTop: '-1px' }}
                    />
                  </div>
                  <p className={cn("text-xs mt-1 transition-colors duration-300", action.completed ? "text-emerald-500/40" : "text-muted-foreground/80")}>
                    {action.description}
                  </p>

                  <AnimatePresence>
                    {action.completedAt && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-[10px] text-emerald-400/60 mt-2 font-medium"
                        suppressHydrationWarning
                      >
                        Secured at{' '}
                        {hasMounted
                          ? new Date(action.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
