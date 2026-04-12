'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface WellnessOrbProps {
  score?: number;
}

export function WellnessOrb({ score = 65 }: WellnessOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

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
  const distort = 0.3 + (score / 100) * 0.3;
  const speed = 2 + (score / 100) * 2;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y -= 0.005;
      coreRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.5) * 0.2;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      coreRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={2.5} color={secondaryColor} />
      <pointLight position={[-10, -10, -5]} intensity={2} color={primaryColor} />

      <Sparkles
        count={80}
        scale={6}
        size={4}
        speed={0.4}
        color={primaryColor}
        opacity={0.4}
        noise={0.1}
      />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[1.5, 64, 64]} />
          <MeshDistortMaterial
            color={secondaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.6}
            roughness={0.1}
            metalness={0.8}
            distort={distort}
            speed={speed}
            transparent
            opacity={0.7}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        <mesh ref={coreRef} scale={[0.8, 0.8, 0.8]}>
          <icosahedronGeometry args={[1.2, 2]} />
          <meshStandardMaterial
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={3}
            wireframe={true}
            transparent
            opacity={0.6}
          />
        </mesh>
      </Float>

      {/* Background soft glow effect */}
      <mesh>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshBasicMaterial color={primaryColor} transparent opacity={0.05} />
      </mesh>
    </group>
  );
}
