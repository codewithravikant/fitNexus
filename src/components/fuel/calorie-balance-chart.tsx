'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';

export interface CalorieDay {
  date: string;
  loggedEstimate?: number;
  target: number;
}

export interface CalorieBalanceChartProps {
  days: CalorieDay[];
}

/** Rough calorie estimate from free-text meal logs is unavailable — show target line vs placeholder. */
export function CalorieBalanceChart({ days }: CalorieBalanceChartProps) {
  const data = days.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'MMM d'),
    balance: (d.loggedEstimate ?? 0) - d.target,
  }));

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip
            contentStyle={{ borderRadius: 8 }}
            formatter={(v) => [typeof v === 'number' ? Math.round(v) : v, 'kcal balance']}
          />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#34d399"
            fill="url(#bal)"
            fillOpacity={0.3}
          />
          <defs>
            <linearGradient id="bal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-1 text-center">
        Deficit / surplus vs daily target (set logged estimates when meal macros are tracked)
      </p>
    </div>
  );
}
