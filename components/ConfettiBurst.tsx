'use client';

import confetti from 'canvas-confetti';

const COLORS = ['#FF6B9D', '#9D4EDD', '#4CC9F0', '#FFD93D', '#06D6A0', '#FF8E72'];

export function burst(opts?: { count?: number }) {
  const n = opts?.count ?? 80;
  confetti({
    particleCount: n,
    spread: 70,
    origin: { y: 0.6 },
    colors: COLORS,
  });
}

export function cannon() {
  confetti({ particleCount: 60, angle: 60,  spread: 55, origin: { x: 0 },   colors: COLORS });
  confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 },   colors: COLORS });
}
