'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeightTrendProps {
  data: Array<{ date: string; weight: number }>;
  targetWeight?: number;
}

export function WeightTrend({ data, targetWeight }: WeightTrendProps) {
  const formatted = data
    .slice(0, 30)
    .reverse()
    .map((d) => ({
      ...d,
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

  const hasEnoughData = formatted.length > 1;
  const weights = hasEnoughData ? formatted.map((d) => d.weight) : [0];
  const minW = Math.min(...weights, targetWeight || Infinity) - 2;
  const maxW = Math.max(...weights) + 2;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Weight Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {hasEnoughData ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={formatted}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <YAxis domain={[minW, maxW]} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
              {targetWeight && (
                <ReferenceLine y={targetWeight} stroke="var(--destructive)" strokeDasharray="5 5" label={{ value: 'Target', fontSize: 10, fill: 'var(--destructive)' }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">Log at least 2 weights to see the trend</p>
        )}
      </CardContent>
    </Card>
  );
}
