'use client';

import { useState, useMemo } from 'react';
import { runPython } from '@/lib/python';
import { Sfx } from '@/lib/sounds';
import { burst } from '@/components/ConfettiBurst';
import { useAppStore } from '@/lib/store';
import { speak } from '@/lib/speak';

export interface Blank { answer: string; options: string[] }
export interface FillBlanksData {
  template: string;              // e.g. "{0} = \"Ava\"\nprint({0})"
  blanks: Blank[];
  expectedOutput: string;
  inputs?: string[];             // optional queued answers to input()
}

interface Props { data: FillBlanksData }

function render(template: string, values: string[]): string {
  return template.replace(/\{(\d+)\}/g, (_, i) => values[parseInt(i, 10)] ?? '▭');
}

export default function FillBlanks({ data }: Props) {
  const [picks, setPicks] = useState<(string | null)[]>(() => data.blanks.map(() => null));
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [output, setOutput] = useState('');
  const [verdict, setVerdict] = useState<'none' | 'right' | 'wrong'>('none');
  const addStars = useAppStore((s) => s.addStars);

  const allFilled = picks.every((p) => p !== null);
  const previewCode = useMemo(
    () => render(data.template, picks.map((p) => p ?? '▭')),
    [data.template, picks],
  );
  const currentCode = useMemo(
    () => render(data.template, picks.map((p) => p ?? '')),
    [data.template, picks],
  );

  const pick = (blankIdx: number, opt: string) => {
    Sfx.click();
    setPicks((prev) => prev.map((p, i) => (i === blankIdx ? opt : p)));
    setOpenIdx(null);
    setVerdict('none');
  };

  const run = () => {
    if (!allFilled) return;
    Sfx.run();
    const r = runPython(currentCode, { inputs: data.inputs });
    setOutput(r.output);
    const allCorrect = picks.every((p, i) => p === data.blanks[i].answer);
    if (allCorrect) {
      setVerdict('right');
      Sfx.success();
      burst({ count: 30 });
      addStars(1);
      speak('Super! You got it!');
    } else {
      setVerdict('wrong');
      Sfx.error();
      speak("Hmm, let's try again!");
      setTimeout(() => {
        setPicks(data.blanks.map(() => null));
        setVerdict('none');
        setOutput('');
      }, 2000);
    }
  };

  return (
    <div className="rounded-3xl border-4 border-pink-light bg-white p-5 shadow-chunk">
      <h3 className="font-display text-xl font-bold text-pink-dark">1. Fill in the blanks</h3>
      <p className="mt-1 text-sm font-semibold text-purple-dark">
        Tap each ▭ to pick a word. When all are filled, press Run!
      </p>

      {/* Code preview with inline chips */}
      <div className="mt-3 rounded-2xl bg-navy p-4 font-code text-lg leading-7 text-[#FFEEC2] whitespace-pre-wrap">
        {splitWithBlanks(data.template, picks).map((part, i) => {
          if (typeof part === 'string') return <span key={i}>{part}</span>;
          const blankIdx = part.index;
          const value = picks[blankIdx];
          return (
            <span key={i} className="relative inline-block">
              <button
                onClick={() => setOpenIdx(openIdx === blankIdx ? null : blankIdx)}
                className={`inline-block rounded-full border-2 px-3 py-0.5 font-bold ${
                  value
                    ? verdict === 'wrong'
                      ? 'border-coral bg-coral/20 text-coral'
                      : 'border-sun bg-sun/30 text-sun'
                    : 'border-dashed border-purple-light bg-purple-light/20 text-cream'
                }`}
              >
                {value ?? '▭'}
              </button>
              {openIdx === blankIdx ? (
                <div className="absolute left-0 top-full z-10 mt-1 flex min-w-[160px] flex-col gap-1 rounded-2xl border-2 border-purple-light bg-white p-2 shadow-chunk">
                  {data.blanks[blankIdx].options.map((o) => (
                    <button
                      key={o}
                      onClick={() => pick(blankIdx, o)}
                      className="rounded-full bg-cream px-3 py-2 text-left font-code text-sm font-bold text-navy hover:bg-pink-light/30"
                    >
                      {o}
                    </button>
                  ))}
                </div>
              ) : null}
            </span>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={run}
          disabled={!allFilled}
          className={`chunk-btn rounded-full px-5 py-3 font-display text-base font-bold text-white shadow-chunk-mint ${
            allFilled ? 'bg-mint' : 'bg-mint/40 cursor-not-allowed'
          }`}
        >
          ▶ Run Code
        </button>
        {verdict === 'right' ? <span className="font-display font-bold text-mint-dark">🎉 Super! +1 ⭐</span> : null}
        {verdict === 'wrong' ? <span className="font-display font-bold text-coral">💡 Hmm, let&apos;s try again!</span> : null}
      </div>

      {output ? (
        <div className="mt-3 rounded-2xl border-2 border-purple-light bg-cream p-3">
          <div className="font-display text-xs font-bold text-purple-dark">Pixi says:</div>
          <pre className="whitespace-pre-wrap font-code text-lg text-navy">{output.replace(/\n$/, '')}</pre>
        </div>
      ) : null}
    </div>
  );
}

// Split template into text + {n} markers for rendering
type Part = string | { index: number };
function splitWithBlanks(template: string, picks: (string | null)[]): Part[] {
  void picks;
  const parts: Part[] = [];
  const re = /\{(\d+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    if (m.index > last) parts.push(template.slice(last, m.index));
    parts.push({ index: parseInt(m[1], 10) });
    last = m.index + m[0].length;
  }
  if (last < template.length) parts.push(template.slice(last));
  return parts;
}
