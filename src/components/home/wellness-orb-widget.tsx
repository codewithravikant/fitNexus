'use client';

import dynamic from 'next/dynamic';

const DashboardScene = dynamic(
  () => import('@/components/three/dashboard-scene').then((m) => m.DashboardScene),
  { ssr: false, loading: () => <OrbPlaceholder /> }
);

function OrbPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 animate-pulse-soft glow-emerald" />
    </div>
  );
}

interface WellnessOrbWidgetProps {
  score?: number;
}

export function WellnessOrbWidget({ score = 50 }: WellnessOrbWidgetProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(52,211,153,0.1)] bg-[rgba(10,18,14,0.5)] backdrop-blur-xl">
      {/* Ambient glow behind orb */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-glow" />
      </div>

      {/* 3D Scene */}
      <div className="relative h-52 w-full">
        <DashboardScene score={score} className="h-full w-full" />
      </div>

      {/* Score overlay */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-5 pb-4">
        <div>
          <p className="text-xs text-muted-foreground">Wellness Score</p>
          <p className="text-2xl font-bold gradient-text">{Math.round(score)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
      </div>
    </div>
  );
}
