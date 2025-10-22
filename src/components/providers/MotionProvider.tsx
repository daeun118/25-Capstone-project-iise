'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * MotionProvider - Optimized Framer Motion provider using LazyMotion
 * 
 * This reduces bundle size by ~30-40 kB by loading only the animation features we use.
 * Uses domAnimation which includes:
 * - animate
 * - whileHover
 * - whileTap
 * - whileFocus
 * - whileDrag
 * - initial
 * - exit
 * 
 * Does NOT include:
 * - layout animations
 * - SVG path animations
 * - 3D transforms
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
