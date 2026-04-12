'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function SecurityPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/blueprint/profile#sign-in');
  }, [router]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">Opening profile…</p>
    </div>
  );
}
