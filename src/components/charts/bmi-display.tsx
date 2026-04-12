import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BMIDisplayProps {
  bmi: number;
  category: string;
}

export function BMIDisplay({ bmi, category }: BMIDisplayProps) {
  const position = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100));

  const categoryColors: Record<string, string> = {
    Underweight: 'text-blue-500',
    Normal: 'text-green-500',
    Overweight: 'text-yellow-500',
    Obese: 'text-red-500',
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">BMI</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-3">
          <span className={`text-3xl font-bold ${categoryColors[category] || ''}`}>
            {bmi.toFixed(1)}
          </span>
          <p className="text-sm text-muted-foreground">{category}</p>
        </div>
        <div className="relative">
          <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-60% via-yellow-400 to-red-400" />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground border-2 border-background shadow-md"
            style={{ left: `calc(${position}% - 8px)` }}
          />
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>40</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
