'use client';

import { motion, useReducedMotion } from 'framer-motion';

const SHAPES = ['☁️', '☁️', '⭐', '🌈', '✨', '🪐', '☁️', '⭐'];

export default function FloatingShapes() {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {SHAPES.map((s, i) => {
        const top = 5 + (i * 11) % 80;
        const size = 24 + ((i * 7) % 40);
        const dur = 30 + ((i * 5) % 40);
        return (
          <motion.span
            key={i}
            className="absolute select-none"
            style={{ top: `${top}%`, fontSize: size, filter: 'drop-shadow(0 4px 8px rgba(59,30,99,.1))' }}
            initial={{ x: '-10vw' }}
            animate={reduce ? { opacity: [0.5, 0.8, 0.5] } : { x: '110vw' }}
            transition={{ duration: dur, repeat: Infinity, delay: -((i * 3) % dur), ease: 'linear' }}
          >
            {s}
          </motion.span>
        );
      })}
    </div>
  );
}
