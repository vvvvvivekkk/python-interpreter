'use client';

import { useMemo, useState } from 'react';
import { Sfx } from '@/lib/sounds';
import { burst } from '@/components/ConfettiBurst';
import { useAppStore } from '@/lib/store';
import { speak } from '@/lib/speak';

export interface Pair { code: string; output: string }
interface Props { pairs: Pair[] }

export default function MatchPairs({ pairs }: Props) {
  // Right column is shuffled; map output index → originally-correct code index
  const shuffled = useMemo(() => {
    const order = pairs.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }, [pairs]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [pickedCode, setPickedCode] = useState<number | null>(null);
  const [wrongFlash, setWrongFlash] = useState<{ code: number; output: number } | null>(null);
  const addStars = useAppStore((s) => s.addStars);

  const allDone = matched.size === pairs.length;

  const tapCode = (i: number) => {
    if (matched.has(i)) return;
    Sfx.click();
    setPickedCode(i);
  };
  const tapOutput = (outIdx: number) => {
    const realIdx = shuffled[outIdx];
    if (matched.has(realIdx) || pickedCode === null) return;
    if (pickedCode === realIdx) {
      Sfx.success();
      const next = new Set(matched);
      next.add(realIdx);
      setMatched(next);
      setPickedCode(null);
      if (next.size === pairs.length) {
        burst({ count: 50 });
        addStars(1);
        speak('All matched! Super!');
      }
    } else {
      Sfx.puzzleWrong();
      setWrongFlash({ code: pickedCode, output: outIdx });
      setTimeout(() => setWrongFlash(null), 500);
      setPickedCode(null);
    }
  };

  return (
    <div className="rounded-3xl border-4 border-sky bg-white p-5 shadow-chunk">
      <h3 className="font-display text-xl font-bold text-pink-dark">2. Match the output</h3>
      <p className="mt-1 text-sm font-semibold text-purple-dark">
        Tap a code card, then the output it makes.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="font-display text-xs font-bold uppercase text-purple-dark">Code</div>
          {pairs.map((p, i) => {
            const done = matched.has(i);
            const picked = pickedCode === i;
            const wrong = wrongFlash?.code === i;
            return (
              <button
                key={i}
                disabled={done}
                onClick={() => tapCode(i)}
                className={`block w-full rounded-2xl border-2 p-3 text-left font-code text-sm whitespace-pre-wrap transition ${
                  done
                    ? 'border-mint bg-mint/20 text-mint-dark opacity-60'
                    : wrong
                      ? 'border-coral bg-coral/20 animate-pulse'
                      : picked
                        ? 'border-pink bg-pink-light/30'
                        : 'border-purple-light bg-cream'
                }`}
              >
                {p.code}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <div className="font-display text-xs font-bold uppercase text-purple-dark">Output</div>
          {shuffled.map((realIdx, i) => {
            const done = matched.has(realIdx);
            const wrong = wrongFlash?.output === i;
            return (
              <button
                key={i}
                disabled={done || pickedCode === null}
                onClick={() => tapOutput(i)}
                className={`block w-full rounded-2xl border-2 p-3 text-left font-code text-sm whitespace-pre-wrap transition ${
                  done
                    ? 'border-mint bg-mint/20 text-mint-dark opacity-60'
                    : wrong
                      ? 'border-coral bg-coral/20 animate-pulse'
                      : pickedCode !== null
                        ? 'border-sun bg-sun/20 cursor-pointer'
                        : 'border-purple-light/50 bg-cream/60'
                }`}
              >
                {pairs[realIdx].output}
              </button>
            );
          })}
        </div>
      </div>

      {allDone ? (
        <div className="mt-4 font-display text-lg font-bold text-mint-dark">🎉 All matched! +1 ⭐</div>
      ) : null}
    </div>
  );
}
