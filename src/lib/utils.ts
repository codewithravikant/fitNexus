import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | Date, pattern = 'MMM d, yyyy') {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return format(d, pattern);
}
