'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MealLogForm } from '@/components/logging/meal-log-form';

export function FloatingActionButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all hover:scale-110 hover:shadow-[0_0_40px_rgba(52,211,153,0.6)] active:scale-95 sm:right-8 md:bottom-8',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
        aria-label="Log meal"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Meal Log</DialogTitle>
          </DialogHeader>
          <MealLogForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
