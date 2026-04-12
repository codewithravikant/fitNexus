'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

interface ThreeCanvasProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

function DefaultFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 animate-pulse-soft" />
    </div>
  );
}

export function ThreeCanvas({ children, fallback, className }: ThreeCanvasProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback || <DefaultFallback />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}
