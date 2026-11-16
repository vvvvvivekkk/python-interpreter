'use client';

/**
 * SpotTheClue — tap each quote " or decimal point . in the line.
 * Teaches the kid to LOOK for the feature that decides the type.
 */

import { useMemo, useState } from 'react';
import { Sfx } from '@/lib/sounds';
import { burst } from '@/components/ConfettiBurst';
import { useAppStore } from '@/lib/store';

interface Props {
  line: string;        // e.g.  print("2.5")
  hunt: '"' | '.';     // what to find
  label: string;       // "Tap every quote " "
}

export default function SpotTheClue({ line, hunt, label }: Props) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const addStars = useAppStore((s) => s.addStars);

  const targets = useMemo(() => {
    const idxs: number[] = [];
    for (let i = 0; i < line.length; i++) if (line[i] === hunt) idxs.push(i);
    return new Set(idxs);
  }, [line, hunt]);

  const allFound = tapped.size === targets.size && targets.size > 0;

  const tap = (i: number) => {
    if (!targets.has(i) || tapped.has(i)) return;
    Sfx.click();
    const next = new Set(tapped);
    next.add(i);
    setTapped(next);
    if (next.size === targets.size) {
      setTimeout(() => {
        Sfx.success();
        burst({ count: 20 });
        addStars(1);
      }, 100);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-sky bg-[#E3F6FF] p-4 shadow-chunk">
      <div className="font-display text-sm font-bold text-sky-dark" style={{ color: '#0E86AF' }}>
        🔍 {label}
      </div>
      <div className="mt-2 font-code text-2xl font-bold tracking-wide text-navy flex flex-wrap">
        {Array.from(line).map((ch, i) => {
          const isTarget = targets.has(i);
          const done = tapped.has(i);
          return (
            <span
              key={i}
              onClick={() => tap(i)}
              className={`inline-block px-0.5 ${
                isTarget
                  ? done
                    ? 'bg-mint text-white rounded-full'
                    : 'cursor-pointer hover:bg-sun hover:rounded-full'
                  : ''
              }`}
              style={{ padding: isTarget ? '0 4px' : undefined }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          );
        })}
      </div>
      <div className="mt-2 text-xs font-semibold text-purple-dark">
        Found: {tapped.size} / {targets.size}
        {allFound && <span className="ml-2 text-mint-dark">✅ Super! +1 ⭐</span>}
      </div>
    </div>
  );
}
