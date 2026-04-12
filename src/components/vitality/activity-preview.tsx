'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Zap,
  Calendar,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ActivityEntry {
  id: string;
  activityType: string;
  durationMin: number;
  intensityLevel: string | null;
  loggedAt: string;
}

interface ActivityPreviewProps {
  /** All activities the server can provide (ideally 3+ months). */
  activities: ActivityEntry[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const intensityDot = (level: string | null) => {
  switch (level) {
    case 'HIGH':
      return 'bg-red-400';
    case 'MODERATE':
      return 'bg-yellow-400';
    case 'LOW':
      return 'bg-green-400';
    default:
      return 'bg-primary';
  }
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ActivityPreview({ activities }: ActivityPreviewProps) {
  const today = new Date();
  const todayKey = toDateKey(today);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);

  /* ---------- group activities by date key ---------- */
  const activityMap = useMemo(() => {
    const map: Record<string, ActivityEntry[]> = {};
    for (const a of activities) {
      const key = toDateKey(new Date(a.loggedAt));
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    // Sort each day newest-first
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
    }
    return map;
  }, [activities]);

  /* ---------- calendar math ---------- */
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const startOffset = firstDow === 0 ? 6 : firstDow - 1; // Mon-start

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  /* ---------- month-level stats ---------- */
  const monthStats = useMemo(() => {
    let activeDays = 0;
    let totalMin = 0;
    let totalSessions = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const list = activityMap[key];
      if (list?.length) {
        activeDays++;
        totalSessions += list.length;
        totalMin += list.reduce((s, a) => s + a.durationMin, 0);
      }
    }
    return { activeDays, totalMin, totalSessions };
  }, [activityMap, viewMonth, viewYear, daysInMonth]);

  /* ---------- navigation ---------- */
  const prevMonth = () => {
    setSelectedDate(null);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (isCurrentMonth) return;
    setSelectedDate(null);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    setSelectedDate(todayKey);
  };

  /* ---------- selected-day data ---------- */
  const selectedActivities = selectedDate ? activityMap[selectedDate] || [] : [];

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatSelectedLabel = (key: string) => {
    const d = new Date(key + 'T12:00:00');
    if (key === todayKey) return 'Today';
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    if (key === toDateKey(yest)) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  /* ---------- heatmap intensity for a day cell ---------- */
  const dayHeat = (count: number, minutes: number) => {
    if (count === 0) return '';
    if (minutes >= 60) return 'bg-primary/25 text-primary';
    if (minutes >= 30) return 'bg-primary/15';
    return 'bg-primary/8';
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Activity Calendar
          </CardTitle>
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="text-[11px] font-medium text-primary hover:underline transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* -------- Month Nav -------- */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-secondary/80 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold tracking-tight">{monthLabel}</span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              isCurrentMonth ? 'opacity-20 cursor-not-allowed' : 'hover:bg-secondary/80'
            )}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* -------- Weekday headers -------- */}
        <div className="grid grid-cols-7 gap-[3px]">
          {WEEKDAY_HEADERS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* -------- Calendar grid -------- */}
        <div className="grid grid-cols-7 gap-[3px]">
          {/* leading empty cells */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}

          {/* day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const list = activityMap[key] || [];
            const hasActivity = list.length > 0;
            const mins = list.reduce((s, a) => s + a.durationMin, 0);
            const isToday = key === todayKey;
            const isSelected = key === selectedDate;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : key)}
                className={cn(
                  'aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 relative transition-all duration-150',
                  'hover:ring-1 hover:ring-primary/40',
                  dayHeat(list.length, mins),
                  isSelected && 'ring-2 ring-primary bg-primary/20 shadow-sm shadow-primary/20',
                  isToday && !isSelected && 'ring-1 ring-primary/60'
                )}
              >
                <span
                  className={cn(
                    'text-[11px] leading-none font-medium',
                    isToday && 'text-primary font-bold',
                    !hasActivity && !isToday && 'text-muted-foreground/70'
                  )}
                >
                  {day}
                </span>

                {/* activity dots */}
                {hasActivity && (
                  <div className="flex items-center gap-[2px]">
                    {list.length <= 3 ? (
                      list.map((a, idx) => (
                        <span
                          key={idx}
                          className={cn('w-[5px] h-[5px] rounded-full', intensityDot(a.intensityLevel))}
                        />
                      ))
                    ) : (
                      <>
                        <span className={cn('w-[5px] h-[5px] rounded-full', intensityDot(list[0].intensityLevel))} />
                        <span className="text-[7px] font-bold text-primary leading-none">
                          +{list.length - 1}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* -------- Month summary strip -------- */}
        <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <strong className="text-foreground">{monthStats.activeDays}</strong> active day{monthStats.activeDays !== 1 ? 's' : ''}
            </span>
            <span className="text-border/60">|</span>
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-primary" />
              <strong className="text-foreground">{monthStats.totalSessions}</strong> session{monthStats.totalSessions !== 1 ? 's' : ''}
            </span>
            <span className="text-border/60">|</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" />
              <strong className="text-foreground">{monthStats.totalMin}</strong> min
            </span>
          </div>
        </div>

        {/* -------- Selected day detail -------- */}
        {selectedDate && (
          <div className="border-t border-border pt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-primary tracking-tight">
                {formatSelectedLabel(selectedDate)}
              </p>
              {selectedActivities.length > 0 && (
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {selectedActivities.reduce((s, a) => s + a.durationMin, 0)} min &middot;{' '}
                  {selectedActivities.length} session{selectedActivities.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {selectedActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/60">
                <Calendar className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs">No activities logged</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                {selectedActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg border border-border/40 px-3 py-2.5 transition-colors',
                      'hover:border-border/80 bg-secondary/20'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
                          activity.intensityLevel === 'HIGH'
                            ? 'bg-red-400/10'
                            : activity.intensityLevel === 'MODERATE'
                              ? 'bg-yellow-400/10'
                              : activity.intensityLevel === 'LOW'
                                ? 'bg-green-400/10'
                                : 'bg-primary/10'
                        )}
                      >
                        <Flame
                          className={cn(
                            'h-4 w-4',
                            activity.intensityLevel === 'HIGH'
                              ? 'text-red-400'
                              : activity.intensityLevel === 'MODERATE'
                                ? 'text-yellow-400'
                                : activity.intensityLevel === 'LOW'
                                  ? 'text-green-400'
                                  : 'text-primary'
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{activity.activityType}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatTime(activity.loggedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                      {activity.intensityLevel && (
                        <span
                          className={cn(
                            'flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                            activity.intensityLevel === 'HIGH'
                              ? 'bg-red-400/10 text-red-400'
                              : activity.intensityLevel === 'MODERATE'
                                ? 'bg-yellow-400/10 text-yellow-400'
                                : 'bg-green-400/10 text-green-400'
                          )}
                        >
                          <Zap className="h-2.5 w-2.5" />
                          {activity.intensityLevel.toLowerCase()}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-muted-foreground font-medium tabular-nums">
                        <Clock className="h-3 w-3" />
                        {activity.durationMin}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
