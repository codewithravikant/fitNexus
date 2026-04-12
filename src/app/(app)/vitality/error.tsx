'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function VitalityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Vitality error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="text-xl font-semibold">Could not load activity data</h2>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t fetch your activity information. Please try again.
        </p>
        <Button onClick={reset}>Retry</Button>
      </div>
    </div>
  );
}
