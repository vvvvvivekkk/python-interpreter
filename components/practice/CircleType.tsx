'use client';

/**
 * CircleType — "circle (tap) only the integers / strings / floats"
 * Mirrors the paper worksheet's circle-only exercises.
 * Tap right → circle lights green. Tap wrong → red shake, -0 but feedback.
 */

import { useMemo, useState } from 'react';
import { Sfx } from '@/lib/sounds';
import { burst } from '@/components/ConfettiBurst';
import { useAppStore } from '@/lib/store';

type PyType = 'int' | 'float' | 'str';

interface Item { label: string; type: PyType }
interface Props {
  hunt: PyType;
  items: Item[];
}

const HUNT_COLOUR: Record<PyType, { bg: string; border: string; text: string; name: string; ico: string }> = {
  int:   { bg: '#FFC9E0', border: '#E22E73', text: '#C13D73', name: 'INTEGERS',  ico: '🔢' },
  float: { bg: '#F4ECFF', border: '#9D4EDD', text: '#7A1AC9', name: 'FLOATS',    ico: '🌊' },
  str:   { bg: '#FFF8D5', border: '#E5A530', text: '#D89520', name: 'STRINGS',   ico: '💬' },
};

export default function CircleType({ hunt, items }: Props) {
  const [got, setGot] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const addStars = useAppStore((s) => s.addStars);

  const targets = useMemo(() => items.filter((i) => i.type === hunt).length, [items, hunt]);
  const done = got.size === targets;
  const c = HUNT_COLOUR[hunt];

  const tap = (idx: number) => {
    if (got.has(idx)) return;
    const item = items[idx];
    if (item.type === hunt) {
      Sfx.success();
      const next = new Set(got);
      next.add(idx);
      setGot(next);
      if (next.size === targets) {
        setTimeout(() => {
          burst({ count: 30 });
          addStars(1);
        }, 150);
      }
    } else {
      Sfx.puzzleWrong();
      const next = new Set(wrong);
      next.add(idx);
      setWrong(next);
      setTimeout(() => {
        setWrong((s) => {
          const n = new Set(s);
          n.delete(idx);
          return n;
        });
      }, 700);
    }
  };

  return (
    <div
      className="rounded-3xl border-4 p-5 shadow-chunk"
      style={{ background: 'white', borderColor: c.border }}
    >
      <h3 className="font-display text-xl font-bold" style={{ color: c.text }}>
        {c.ico} Tap only the {c.name}
      </h3>
      <p className="mt-1 text-sm font-semibold text-purple-dark">
        {hunt === 'int'   && 'Whole numbers — no dot, no quotes!'}
        {hunt === 'float' && 'Numbers WITH a dot — no quotes!'}
        {hunt === 'str'   && 'Anything wrapped in quotes " "!'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 rounded-2xl p-3" style={{ background: c.bg + '55' }}>
        {items.map((it, i) => {
          const found = got.has(i);
          const flash = wrong.has(i);
          return (
            <button
              key={i}
              onClick={() => tap(i)}
              disabled={found}
              className={`chunk-btn rounded-full border-[3px] px-4 py-2 font-code text-base font-bold transition ${
                flash ? 'animate-pulse' : ''
              }`}
              style={{
                background: found ? c.bg : flash ? '#FFE0E8' : 'white',
                borderColor: found ? c.border : flash ? '#FF8E72' : '#CFC3DF',
                color: found ? c.text : flash ? '#C93820' : '#1a1a2e',
                textDecoration: found ? 'line-through' : 'none',
                opacity: found ? 0.9 : 1,
              }}
            >
              {found && '✓ '}{it.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 text-sm font-semibold text-purple-dark">
        Found: {got.size} / {targets}
        {done && <span className="ml-2 font-bold" style={{ color: c.text }}>🎉 All found! +1 ⭐</span>}
      </div>
    </div>
  );
}
