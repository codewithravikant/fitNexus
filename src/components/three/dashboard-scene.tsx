'use client';

import dynamic from 'next/dynamic';

const ThreeCanvas = dynamic(
  () => import('./three-canvas').then((m) => m.ThreeCanvas),
  { ssr: false }
);

const DashboardOrb = dynamic(
  () => import('./dashboard-orb').then((m) => m.DashboardOrb),
  { ssr: false }
);

const AmbientParticles = dynamic(
  () => import('./ambient-particles').then((m) => m.AmbientParticles),
  { ssr: false }
);

interface DashboardSceneProps {
  score?: number;
  className?: string;
}

export function DashboardScene({ score = 50, className }: DashboardSceneProps) {
  return (
    <ThreeCanvas className={className}>
      <DashboardOrb score={score} size={1.2} />
      <AmbientParticles count={30} spread={4} />
    </ThreeCanvas>
  );
}
