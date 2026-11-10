'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sfx } from '@/lib/sounds';
import { burst } from './ConfettiBurst';
import { useAppStore } from '@/lib/store';
import { speak } from '@/lib/speak';

export interface Puzzle {
  id: string;
  code: string;
  options: string[];
  correct: number;
  hint: string;
}

interface Props {
  puzzle: Puzzle;
  onNext: () => void;
}

export default function PuzzleCard({ puzzle, onNext }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const addStars = useAppStore((s) => s.addStars);
  const bump = useAppStore((s) => s.bumpGuessStreak);

  // Shuffle a display order, but remember the correct index.
  const order = useMemo(() => {
    const idxs = puzzle.options.map((_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    return idxs;
  }, [puzzle]);

  useEffect(() => { setPicked(null); }, [puzzle.id]);

  const pick = (optIdx: number) => {
    setPicked(optIdx);
    const right = optIdx === puzzle.correct;
    if (right) {
      Sfx.puzzleRight();
      burst({ count: 40 });
      addStars(1);
      bump(true);
      speak('Yes! Super guess!');
    } else {
      Sfx.puzzleWrong();
      bump(false);
      speak("Not quite! " + puzzle.hint);
    }
  };

  return (
    <div className="rounded-3xl border-4 border-purple-light bg-white p-6 shadow-chunk">
      <div className="rounded-2xl bg-navy p-5 font-code text-lg leading-8 text-[#FFEEC2] whitespace-pre-wrap">
        {puzzle.code}
      </div>
      <p className="mt-4 font-display font-semibold text-purple-dark">
        What will the computer say?
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {order.map((realIdx) => {
          const isPicked = picked === realIdx;
          const isRight = realIdx === puzzle.correct;
          const color =
            picked === null
              ? 'bg-cream border-[#FFE1B8]'
              : isRight
                ? 'bg-mint/30 border-mint text-mint-dark'
                : isPicked
                  ? 'bg-pink-light/30 border-pink'
                  : 'bg-cream border-[#FFE1B8] opacity-60';
          return (
            <button
              key={realIdx}
              disabled={picked !== null}
              onClick={() => pick(realIdx)}
              onMouseEnter={() => Sfx.hover()}
              className={`chunk-btn rounded-3xl border-[3px] px-3 py-5 font-display text-xl font-bold shadow-chunk ${color}`}
            >
              {puzzle.options[realIdx]}
            </button>
          );
        })}
      </div>
      {picked !== null ? (
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display font-bold text-navy">
            {picked === puzzle.correct ? '🎉 Right! +1 ⭐' : '💡 ' + puzzle.hint}
          </span>
          <button
            onClick={() => { Sfx.click(); onNext(); }}
            className="chunk-btn rounded-full bg-pink px-5 py-3 font-display font-bold text-white shadow-chunk-pink"
          >
            Next ➡
          </button>
        </div>
      ) : null}
    </div>
  );
}
