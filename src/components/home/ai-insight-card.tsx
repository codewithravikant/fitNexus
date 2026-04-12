'use client';

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface AIInsightCardProps {
  insightText: string;
  insightExpanded?: string;
  fallbackUsed: boolean;
}

export function AIInsightCard({ insightText, insightExpanded, fallbackUsed }: AIInsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent relative overflow-hidden group">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />

      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Orb behind Sparkles */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-emerald-400 rounded-full blur-md"
            />
            <Sparkles className="h-5 w-5 text-emerald-400 relative z-10" />
          </div>
          <CardTitle className="text-base text-emerald-50 font-semibold tracking-wide">AI Insight of the Day</CardTitle>
        </div>
        {fallbackUsed && (
          <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest mt-1">Based on general wellness guidelines (AI momentarily observing)</p>
        )}
      </CardHeader>
      <CardContent className="relative z-10">
        {/* Animated text block */}
        <motion.p
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-sm leading-relaxed text-emerald-50/90 font-medium"
        >
          {insightText}
        </motion.p>

        {insightExpanded && (
          <>
            <AnimatePresence>
              {expanded && (
                <motion.p
                  initial={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
                  exit={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4, type: 'spring', bounce: 0 }}
                  className="mt-3 text-sm leading-relaxed text-emerald-200/70"
                >
                  {insightExpanded}
                </motion.p>
              )}
            </AnimatePresence>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold uppercase tracking-wider transition-colors"
            >
              {expanded ? (
                <>Collapse detail <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Deep dive <ChevronDown className="h-4 w-4" /></>
              )}
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
