'use client';

import { WellnessOrb } from './wellness-orb';
import { HealthParticles } from './health-particles';
import { OrbitControls } from '@react-three/drei';

export function LandingScene() {
  return (
    <>
      <WellnessOrb score={75} />
      <HealthParticles count={80} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}
