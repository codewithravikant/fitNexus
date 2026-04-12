'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface DashboardOrbProps {
  score?: number;
  size?: number;
}

export function DashboardOrb({ score = 50, size = 1 }: DashboardOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const getColor = (s: number) => {
    if (s >= 80) return '#10b981'; // vibrant green
    if (s >= 60) return '#3b82f6'; // calm blue
    if (s >= 40) return '#f59e0b'; // warm yellow/orange
    return '#ec4899'; // uplifting pink
  };

  const getSecondaryColor = (s: number) => {
    if (s >= 80) return '#6ee7b7';
    if (s >= 60) return '#93c5fd';
    if (s >= 40) return '#fde047';
    return '#fbcfe8';
  };

  const primaryColor = getColor(score);
  const secondaryColor = getSecondaryColor(score);
  const distort = 0.2 + (score / 100) * 0.3;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y -= 0.005;
      coreRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      coreRef.current.scale.setScalar(scale);
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      ringRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.4) * 0.1;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={2} color={secondaryColor} />
      <pointLight position={[-5, -5, -5]} intensity={1.5} color={primaryColor} />

      <Sparkles
        count={60}
        scale={size * 4}
        size={size * 3}
        speed={0.3}
        color={primaryColor}
        opacity={0.6}
        noise={0.2}
      />

      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1.5}>
        {/* Main translucent glass orb */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[size, 64, 64]} />
          <MeshDistortMaterial
            color={secondaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.8}
            roughness={0.1}
            metalness={0.9}
            distort={distort}
            speed={2}
            transparent
            opacity={0.85}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Pulsing inner core */}
        <mesh ref={coreRef} scale={[size * 0.6, size * 0.6, size * 0.6]}>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={3}
            wireframe={true}
            transparent
            opacity={0.7}
          />
        </mesh>
      </Float>

      {/* Floating elegant ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[size * 1.7, 0.015, 32, 100]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}
