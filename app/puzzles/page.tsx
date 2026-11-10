'use client';

import { useState } from 'react';
import puzzlesData from '@/content/puzzles.json';
import PuzzleCard, { Puzzle } from '@/components/PuzzleCard';
import { Sfx } from '@/lib/sounds';

export default function PuzzlesPage() {
  const puzzles = puzzlesData as Puzzle[];
  const [idx, setIdx] = useState(0);
  const p = puzzles[idx % puzzles.length];
  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between rounded-3xl border-4 border-purple-light bg-white/90 p-4 shadow-chunk">
        <h1 className="font-display text-2xl font-bold text-navy">🎯 Guess the Output</h1>
        <span className="font-display text-sm font-bold text-purple-dark">
          Puzzle {idx + 1} / {puzzles.length}
        </span>
      </div>
      <PuzzleCard
        puzzle={p}
        onNext={() => { Sfx.click(); setIdx((i) => (i + 1) % puzzles.length); }}
      />
    </div>
  );
}
