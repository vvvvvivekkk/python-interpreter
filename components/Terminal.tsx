'use client';

import { useEffect, useRef, useState } from 'react';
import { Sfx } from '@/lib/sounds';
import { Eraser } from 'lucide-react';

interface Props {
  output: string;
  error?: { friendly: string; emoji: string } | null;
  onClear?: () => void;
}

/**
 * Typewriter terminal. Characters appear at 28ms/char.
 * A soft tick plays every third character (throttled inside Sfx).
 */
export default function Terminal({ output, error, onClear }: Props) {
  const [typed, setTyped] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<string>('');

  useEffect(() => {
    if (output === prevRef.current) return;
    prevRef.current = output;
    setTyped('');
    if (!output) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(output.slice(0, i));
      if (i % 3 === 0) Sfx.type();
      if (i >= output.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [output]);

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [typed]);

  const lines = typed.replace(/\n$/, '').split('\n');

  return (
    <div className="relative rounded-3xl border-4 border-[#FFE1B8] bg-gradient-to-b from-cream to-[#FFF1D0] p-4 shadow-chunk">
      <div className="absolute right-3 top-3 flex items-center gap-2">
        <span className="text-2xl">🤖</span>
        {onClear ? (
          <button
            onClick={() => { Sfx.click(); onClear(); }}
            className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#FFE1B8] bg-white"
            aria-label="Clear terminal"
            title="Clear"
          >
            <Eraser size={16} />
          </button>
        ) : null}
      </div>
      <div
        ref={boxRef}
        className="min-h-[160px] whitespace-pre-wrap break-words font-code text-lg leading-7 text-navy"
        aria-live="polite"
      >
        {!typed && !error && (
          <span className="italic text-purple/60">Press ▶ Run Code to see the magic!</span>
        )}
        {lines.map((line, i) => (
          <div key={i}>
            <span className="mr-2 select-none font-bold text-[#4CC9F0]">&gt;</span>
            <span className={/^(Oops|Error|Hmm)/.test(line) ? 'text-coral' : ''}>{line}</span>
          </div>
        ))}
        {error ? (
          <div className="mt-2 font-bold text-coral">
            <span className="mr-1">{error.emoji}</span>{error.friendly}
          </div>
        ) : null}
        {typed && typed === output && <span className="pfw-cursor" aria-hidden="true" />}
      </div>
    </div>
  );
}
