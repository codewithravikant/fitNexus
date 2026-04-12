'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AmbientParticlesProps {
  count?: number;
  spread?: number;
}

function createAmbientData(count: number, spread: number) {
  const pos = new Float32Array(count * 3);
  const spd = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5;
    spd[i] = 0.2 + Math.random() * 0.8;
  }
  return { positions: pos, speeds: spd };
}

export function AmbientParticles({ count = 40, spread = 5 }: AmbientParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [{ positions, speeds }] = useState(() => createAmbientData(count, spread));

  useFrame((state) => {
    if (pointsRef.current) {
      const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        posArray[i * 3 + 1] += Math.sin(state.clock.elapsedTime * speeds[i] + i) * 0.001;
        posArray[i * 3] += Math.cos(state.clock.elapsedTime * speeds[i] * 0.5 + i) * 0.0005;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#34d399"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}
