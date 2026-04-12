'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

interface WhyMicrocopyProps {
  text: string;
}

export function WhyMicrocopy({ text }: WhyMicrocopyProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      className="flex items-start gap-2 text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <span className={expanded ? '' : 'line-clamp-1'}>
        {expanded ? text : 'Why we ask this'}
      </span>
    </button>
  );
}
