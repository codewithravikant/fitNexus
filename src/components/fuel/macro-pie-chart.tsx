'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#34d399', '#60a5fa', '#fbbf24'];

export interface MacroPieChartProps {
  proteinG: number;
  carbsG: number;
  fatsG: number;
}

export function MacroPieChart({ proteinG, carbsG, fatsG }: MacroPieChartProps) {
  const data = [
    { name: 'Protein', value: Math.max(0, proteinG * 4) },
    { name: 'Carbs', value: Math.max(0, carbsG * 4) },
    { name: 'Fats', value: Math.max(0, fatsG * 9) },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total <= 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">No macro data to display yet.</p>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [
              typeof v === 'number' ? `${Math.round(v)} kcal` : String(v),
              '',
            ]}
            contentStyle={{ borderRadius: 8 }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-xs text-center text-muted-foreground mt-1">
        Energy split (kcal from macros · targets)
      </p>
    </div>
  );
}
