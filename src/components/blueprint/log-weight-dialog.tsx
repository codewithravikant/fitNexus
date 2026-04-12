'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { WeightLogForm } from '@/components/logging/weight-log-form';

interface LogWeightDialogProps {
  currentWeight?: number | null;
}

export function LogWeightDialog({ currentWeight }: LogWeightDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Scale className="h-3.5 w-3.5" /> Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Log Weight</DialogTitle></DialogHeader>
        <WeightLogForm currentWeight={currentWeight ?? undefined} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
