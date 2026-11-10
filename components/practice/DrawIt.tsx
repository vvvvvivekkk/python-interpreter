'use client';

import { useState } from 'react';
import { Sfx } from '@/lib/sounds';
import { burst } from '@/components/ConfettiBurst';
import { useAppStore } from '@/lib/store';
import { speak } from '@/lib/speak';

export interface DrawItData {
  code: string;
  correctOutput: string;
  options: string[];
}

interface Props { data: DrawItData }

export default function DrawIt({ data }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const addStars = useAppStore((s) => s.addStars);

  const show = () => {
    Sfx.click();
    setRevealed(true);
    if (picked === data.correctOutput) {
      Sfx.success();
      burst({ count: 40 });
      addStars(1);
      speak('You got it!');
    } else {
      Sfx.puzzleWrong();
      speak(`Close! Pixi showed ${data.correctOutput}`);
    }
  };
  const reset = () => { setPicked(null); setRevealed(false); };

  return (
    <div className="rounded-3xl border-4 border-purple bg-white p-5 shadow-chunk">
      <h3 className="font-display text-xl font-bold text-pink-dark">4. What will Pixi show?</h3>
      <p className="mt-1 text-sm font-semibold text-purple-dark">
        Pick what the computer will show, then press Show me!
      </p>

      <div className="mt-3 rounded-2xl bg-navy p-4 font-code text-lg leading-7 text-[#FFEEC2] whitespace-pre-wrap">
        {data.code}
      </div>

      <div className="mt-3 flex items-center justify-center">
        <div className={`grid h-32 w-32 place-items-center rounded-2xl border-4 border-dashed ${
          revealed
            ? picked === data.correctOutput
              ? 'border-mint bg-mint/10'
              : 'border-coral bg-coral/10'
            : 'border-purple-light bg-purple-light/10'
        }`}>
          <span className="text-center font-code text-lg text-navy whitespace-pre-wrap p-2">
            {picked ?? '?'}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {data.options.map((o) => (
          <button
            key={o}
            onClick={() => { if (!revealed) { Sfx.click(); setPicked(o); } }}
            className={`rounded-full border-2 px-4 py-2 font-code text-base font-bold shadow-chunk ${
              picked === o ? 'border-pink bg-pink-light/30' : 'border-purple-light bg-cream'
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {!revealed ? (
          <button
            onClick={show}
            disabled={!picked}
            className={`chunk-btn rounded-full px-5 py-3 font-display text-base font-bold text-white shadow-chunk-pink ${
              picked ? 'bg-pink' : 'bg-pink/40 cursor-not-allowed'
            }`}
          >
            ▶ Show me
          </button>
        ) : (
          <>
            <div className="font-display font-bold text-navy">
              Pixi showed: <span className="font-code text-pink-dark">{data.correctOutput}</span>
            </div>
            <button onClick={reset} className="chunk-btn rounded-full border-2 border-purple-light bg-cream px-4 py-2 font-display font-bold">
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
