'use client';

import { cn } from '@/lib/utils';
import { Label } from './label';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, required, className, hint, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label required={required}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
