'use client';

import { useState } from 'react';
import { runPython } from '@/lib/python';
import { Sfx } from '@/lib/sounds';
import { burst } from '@/components/ConfettiBurst';
import { useAppStore } from '@/lib/store';
import { speak } from '@/lib/speak';

export interface ChallengeData {
  prompt: string;
  hint: string;
}

interface Props { data: ChallengeData }

export default function Challenge({ data }: Props) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const addStars = useAppStore((s) => s.addStars);

  const run = () => {
    Sfx.run();
    const r = runPython(code);
    setOutput(r.output);
    if (r.error) {
      setErr(r.error.friendly);
      Sfx.error();
      speak('Almost! Check your code.');
    } else {
      setErr(null);
      if (r.output.trim().length > 0) {
        Sfx.success();
        burst({ count: 30 });
        addStars(1);
        speak('Super programmer!');
      }
    }
  };

  return (
    <div className="rounded-3xl border-4 border-sun bg-gradient-to-br from-[#FFF8D5] to-cream p-5 shadow-chunk">
      <h3 className="font-display text-xl font-bold text-pink-dark">5. Challenge!</h3>
      <p className="mt-2 font-display text-base font-bold text-navy">
        ✍️ {data.prompt}
      </p>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        placeholder="Type your code here..."
        className="mt-3 w-full resize-y rounded-2xl border-2 border-purple-light bg-white p-3 font-code text-lg outline-none focus:border-pink"
        style={{ minHeight: 80 }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={run}
          disabled={!code.trim()}
          className={`chunk-btn rounded-full px-5 py-3 font-display text-base font-bold text-white shadow-chunk-mint ${
            code.trim() ? 'bg-mint' : 'bg-mint/40 cursor-not-allowed'
          }`}
        >
          ▶ Run my code
        </button>
        <button
          onClick={() => { Sfx.click(); setShowHint(!showHint); }}
          className="chunk-btn rounded-full border-2 border-sun bg-white px-4 py-3 font-display font-bold"
        >
          💡 {showHint ? 'Hide' : 'Hint'}
        </button>
      </div>

      {showHint ? (
        <div className="mt-3 rounded-2xl border-2 border-sun bg-sun/10 p-3 font-code text-sm text-navy whitespace-pre-wrap">
          {data.hint}
        </div>
      ) : null}

      {output || err ? (
        <div className="mt-3 rounded-2xl border-2 border-purple-light bg-cream p-3">
          <div className="font-display text-xs font-bold text-purple-dark">Pixi says:</div>
          {err ? (
            <div className="font-display font-bold text-coral">💡 {err}</div>
          ) : (
            <pre className="whitespace-pre-wrap font-code text-lg text-navy">{output.replace(/\n$/, '')}</pre>
          )}
        </div>
      ) : null}

      <div className="mt-3 rounded-full border-2 border-purple bg-purple/10 px-3 py-2 text-center font-display text-sm font-bold text-purple-dark">
        📝 Write it on paper too — bring to Sunday&apos;s class!
      </div>
    </div>
  );
}
