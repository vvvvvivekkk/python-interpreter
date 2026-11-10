'use client';

import { useState, useMemo } from 'react';
import { Sfx } from '@/lib/sounds';

export interface Slot { icon: string; options: string[] }
export interface ColourBoxesData {
  template: string;
  slots: Slot[];
}

interface Props { data: ColourBoxesData }

export default function ColourBoxes({ data }: Props) {
  const [idxs, setIdxs] = useState<number[]>(() => data.slots.map(() => 0));
  const picks = useMemo(() => idxs.map((i, s) => data.slots[s].options[i]), [idxs, data.slots]);
  const rendered = useMemo(
    () => data.template.replace(/\{(\d+)\}/g, (_, n) => picks[parseInt(n, 10)] ?? ''),
    [data.template, picks],
  );
  const cycle = (slot: number) => {
    Sfx.click();
    setIdxs((prev) =>
      prev.map((v, i) => (i === slot ? (v + 1) % data.slots[slot].options.length : v)),
    );
  };

  return (
    <div className="rounded-3xl border-4 border-sun bg-white p-5 shadow-chunk">
      <h3 className="font-display text-xl font-bold text-pink-dark">3. Fill the boxes</h3>
      <p className="mt-1 text-sm font-semibold text-purple-dark">
        Tap each coloured box to change its value. Watch the code update!
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
        {data.slots.map((s, i) => (
          <button
            key={i}
            onClick={() => cycle(i)}
            className="chunk-btn rounded-3xl border-[3px] border-sun bg-gradient-to-br from-sun to-[#FFB800] p-4 text-center font-display font-bold text-navy shadow-chunk min-w-[120px]"
          >
            <div className="text-3xl">{s.icon}</div>
            <div className="mt-1 font-code text-lg">{picks[i]}</div>
            <div className="mt-1 text-xs opacity-75">tap to change</div>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-navy p-4 font-code text-base leading-6 text-[#FFEEC2] whitespace-pre-wrap">
        {rendered}
      </div>
    </div>
  );
}
