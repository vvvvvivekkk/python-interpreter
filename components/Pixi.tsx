'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

export type PixiState = 'idle' | 'talking' | 'thinking' | 'celebrating' | 'error' | 'pointing';

interface Props {
  state?: PixiState;
  size?: number;
  onClick?: () => void;
  bubble?: string | null;
}

export default function Pixi({ state = 'idle', size = 92, onClick, bubble }: Props) {
  const reduce = useReducedMotion();
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 160);
    }, 3500 + Math.random() * 2500);
    return () => clearInterval(id);
  }, []);

  const bob = reduce
    ? {}
    : state === 'celebrating'
      ? { rotate: [0, -10, 10, -10, 0], y: [0, -8, 0, -8, 0] }
      : state === 'error'
        ? { y: [0, 4, 0] }
        : { y: [0, -8, 0] };
  const bobT = {
    duration: state === 'celebrating' ? 0.8 : 3.2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  };

  const antennaColor = state === 'error' ? '#C8A4FF' : '#FFD93D';
  const eyeShape = state === 'error'
    ? { rx: 7, ry: 5, mouth: 'M 36 60 Q 50 54 64 60' }
    : state === 'thinking'
      ? { rx: 7, ry: 7, mouth: 'M 42 60 Q 50 60 58 60' }
      : state === 'celebrating'
        ? { rx: 7, ry: 7, mouth: 'M 36 58 Q 50 70 64 58' }
        : { rx: 7, ry: 7, mouth: 'M 40 58 Q 50 66 60 58' };
  const talkMouth = state === 'talking';

  return (
    <div className="relative inline-block" style={{ width: size, height: size + 12 }}>
      {bubble ? (
        <div
          aria-live="polite"
          className="absolute left-full top-0 ml-3 whitespace-nowrap rounded-xl border-2 border-purple-light bg-white px-3 py-2 text-sm font-semibold shadow-chunk"
          style={{ fontFamily: 'Fredoka' }}
        >
          <span className="absolute -left-2 top-3 h-0 w-0 border-y-8 border-r-8 border-y-transparent border-r-purple-light" />
          {bubble}
        </div>
      ) : null}

      <motion.button
        type="button"
        onClick={onClick}
        aria-label={`Pixi the robot — ${state}`}
        className="focus:outline-none"
        animate={bob}
        transition={bobT}
        whileTap={{ scale: 0.92 }}
      >
        <svg viewBox="0 0 100 112" width={size} height={size + 12} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="body" cx=".4" cy=".35" r=".8">
              <stop offset="0" stopColor="#C8A4FF" />
              <stop offset="1" stopColor="#7A1AC9" />
            </radialGradient>
            <radialGradient id="face" cx=".5" cy=".4" r=".7">
              <stop offset="0" stopColor="#F8F0FF" />
              <stop offset="1" stopColor="#E0C7FF" />
            </radialGradient>
          </defs>
          {/* Antenna */}
          <motion.circle
            cx="50" cy="12" r="5" fill={antennaColor}
            animate={reduce ? {} : { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <line x1="50" y1="17" x2="50" y2="26" stroke="#7A1AC9" strokeWidth="3" strokeLinecap="round" />
          {/* Body */}
          <rect x="18" y="28" width="64" height="62" rx="24" fill="url(#body)" />
          {/* Face plate */}
          <rect x="26" y="38" width="48" height="36" rx="18" fill="url(#face)" />
          {/* Eyes */}
          <ellipse cx="40" cy="52" rx={blinking ? 7 : eyeShape.rx} ry={blinking ? 0.6 : eyeShape.ry} fill="#1a1a2e" />
          <ellipse cx="60" cy="52" rx={blinking ? 7 : eyeShape.rx} ry={blinking ? 0.6 : eyeShape.ry} fill="#1a1a2e" />
          {!blinking && (
            <>
              <circle cx="42" cy="50" r="2" fill="white" />
              <circle cx="62" cy="50" r="2" fill="white" />
            </>
          )}
          {/* Cheeks */}
          <circle cx="32" cy="63" r="3" fill="#FFB3D1" opacity=".8" />
          <circle cx="68" cy="63" r="3" fill="#FFB3D1" opacity=".8" />
          {/* Mouth */}
          {talkMouth ? (
            <motion.ellipse
              cx="50" cy="62" rx="6" ry="3" fill="#1a1a2e"
              animate={reduce ? {} : { ry: [2, 4, 2] }}
              transition={{ duration: 0.35, repeat: Infinity }}
            />
          ) : (
            <path d={eyeShape.mouth} fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
          )}
          {/* Arms */}
          <motion.circle
            cx="18" cy="60" r="6" fill="#9D4EDD"
            animate={reduce ? {} : state === 'celebrating' ? { y: [-4, -12, -4] } : { y: [0, -3, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <motion.circle
            cx="82" cy="60" r="6" fill="#9D4EDD"
            animate={reduce ? {} : state === 'pointing' ? { x: [0, 6, 0] } : { y: [0, 3, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          {/* Feet */}
          <rect x="30" y="90" width="14" height="8" rx="4" fill="#7A1AC9" />
          <rect x="56" y="90" width="14" height="8" rx="4" fill="#7A1AC9" />
        </svg>
      </motion.button>
    </div>
  );
}
