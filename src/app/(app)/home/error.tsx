'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomeError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Wellness Dashboard</h1>
        <p className="text-sm text-muted-foreground">Something went wrong</p>
      </div>
      <Card>
        <CardContent className="py-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your daily briefing. Don&apos;t worry - your data is safe.
          </p>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Fallback plan:</p>
            <ul className="text-sm text-left max-w-xs mx-auto space-y-1">
              <li>1. Take a 20-minute walk</li>
              <li>2. Drink 8 glasses of water</li>
              <li>3. 5-minute breathing exercise</li>
            </ul>
          </div>
          <Button onClick={reset} variant="outline">Try again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
