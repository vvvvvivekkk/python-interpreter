'use client';

/**
 * InteractiveConvert — kid picks a starting value and a conversion
 * (int / float / str) and sees what Python ACTUALLY returns.
 * Uses the real interpreter — no fake outputs.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { runPython } from '@/lib/python';
import { Sfx } from '@/lib/sounds';
import { burst } from '@/components/ConfettiBurst';
import { useAppStore } from '@/lib/store';

const PRESETS: { label: string; value: string; hint: string }[] = [
  { label: 'the string "5"',       value: '"5"',     hint: 'a word that looks like a number' },
  { label: 'the number 2.7',       value: '2.7',     hint: 'a float' },
  { label: 'the number 5',         value: '5',       hint: 'an integer' },
  { label: 'the string "3.14"',    value: '"3.14"',  hint: 'a word that looks like a decimal' },
  { label: 'the number 100',       value: '100',     hint: 'an integer' },
];

type Fn = 'int' | 'float' | 'str';

const FN_COLOUR: Record<Fn, { bg: string; border: string; text: string }> = {
  int:   { bg: '#FFC9E0', border: '#E22E73', text: '#C13D73' },
  float: { bg: '#F4ECFF', border: '#9D4EDD', text: '#7A1AC9' },
  str:   { bg: '#FFF8D5', border: '#E5A530', text: '#D89520' },
};

function detectType(s: string): Fn | 'error' {
  const t = s.trim();
  if (!t) return 'error';
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return 'str';
  if (/^-?\d+\.\d+$/.test(t)) return 'float';
  if (/^-?\d+$/.test(t)) return 'int';
  return 'error';
}

export default function InteractiveConvert() {
  const [value, setValue] = useState<string>('"5"');
  const [picked, setPicked] = useState<Fn | null>(null);
  const [output, setOutput] = useState<string>('');
  const [outType, setOutType] = useState<Fn | 'error'>('error');
  const [animatingTo, setAnimatingTo] = useState<Fn | null>(null);
  const addStars = useAppStore((s) => s.addStars);

  const startType = detectType(value);

  const convert = (fn: Fn) => {
    Sfx.click();
    setPicked(fn);
    setAnimatingTo(fn);
    const code = `print(${fn}(${value}))`;
    const r = runPython(code);
    if (r.error) {
      setOutput('⚠️ ' + r.error.friendly);
      setOutType('error');
      Sfx.puzzleWrong();
    } else {
      const out = r.output.replace(/\n$/, '');
      setOutput(out);
      // The TYPE of the result is always `fn` if it ran cleanly
      setOutType(fn);
      Sfx.success();
      if (startType !== 'error') {
        burst({ count: 15 });
        addStars(1);
      }
    }
    setTimeout(() => setAnimatingTo(null), 600);
  };

  const fromC = startType !== 'error' ? FN_COLOUR[startType] : { bg: '#eee', border: '#ccc', text: '#999' };
  const toC = outType !== 'error' ? FN_COLOUR[outType as Fn] : { bg: '#FFE0E8', border: '#FF8E72', text: '#C93820' };

  return (
    <div className="rounded-3xl border-4 border-sun bg-white p-5 shadow-chunk">
      <h3 className="font-display text-xl font-bold text-pink-dark">🔄 Convert the magic words</h3>
      <p className="mt-1 text-sm font-semibold text-purple-dark">
        Pick a value, then tap a magic word to CHANGE its type. Watch what Pixi says!
      </p>

      {/* Step 1: pick a value */}
      <div className="mt-4 rounded-2xl border-2 border-purple-light bg-cream p-4">
        <div className="font-display text-sm font-bold text-purple-dark">1️⃣ I have this value:</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={value}
            onChange={(e) => { setValue(e.target.value); setOutput(''); setPicked(null); }}
            spellCheck={false}
            className="rounded-full border-2 border-purple-light bg-white px-4 py-2 font-code text-xl font-bold outline-none focus:border-pink"
            style={{ minWidth: 140, maxWidth: '100%' }}
          />
          <span
            className="rounded-full border-2 px-3 py-1 font-display text-sm font-bold"
            style={{ background: fromC.bg, borderColor: fromC.border, color: fromC.text }}
          >
            {startType === 'error' ? '❓ not sure' : startType.toUpperCase()}
          </span>
        </div>
        {/* preset chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="self-center font-display text-xs font-bold text-purple-dark">or try:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setValue(p.value); setOutput(''); setPicked(null); Sfx.click(); }}
              className="chunk-btn rounded-full border-2 border-purple-light bg-white px-3 py-1 font-code text-sm font-bold text-navy hover:bg-pink-light/30"
              title={p.hint}
            >
              {p.value}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: pick a conversion */}
      <div className="mt-4 rounded-2xl border-2 border-purple-light bg-cream p-4">
        <div className="font-display text-sm font-bold text-purple-dark">2️⃣ Turn it into a:</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['int', 'float', 'str'] as Fn[]).map((fn) => {
            const c = FN_COLOUR[fn];
            const isPicked = picked === fn;
            return (
              <button
                key={fn}
                onClick={() => convert(fn)}
                className="chunk-btn rounded-2xl border-[3px] px-4 py-3 font-code text-lg font-bold shadow-chunk"
                style={{
                  background: isPicked ? c.bg : 'white',
                  borderColor: c.border,
                  color: c.text,
                }}
              >
                {fn}({value || '?'})
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: see the result */}
      <AnimatePresence mode="wait">
        {output && (
          <motion.div
            key={output + outType}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-2xl border-[3px] p-4"
            style={{ background: toC.bg, borderColor: toC.border }}
          >
            <div className="font-display text-sm font-bold" style={{ color: toC.text }}>
              3️⃣ Pixi says:
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-navy px-4 py-2 font-code text-xl font-bold text-[#FFEEC2]">
                {output}
              </span>
              {outType !== 'error' && (
                <span
                  className="rounded-full border-2 px-3 py-1 font-display text-sm font-bold"
                  style={{ background: 'white', borderColor: toC.border, color: toC.text }}
                >
                  now it&apos;s a {outType.toUpperCase()}!
                </span>
              )}
            </div>
            {outType !== 'error' && (
              <div className="mt-2 font-display text-xs font-semibold" style={{ color: toC.text }}>
                ✨ {picked === 'int' && 'int() chopped off the decimal part (if any) and gave us a whole number.'}
                {picked === 'float' && 'float() gave us a number WITH a decimal point.'}
                {picked === 'str' && 'str() wrapped it in quotes so now it\'s a word!'}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flow visualization */}
      {animatingTo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-3 flex items-center justify-center gap-2 text-2xl font-bold"
        >
          <span style={{ color: fromC.text }}>{startType === 'error' ? '?' : startType.toUpperCase()}</span>
          <motion.span
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 0.6 }}
            className="text-3xl"
          >
            →
          </motion.span>
          <span style={{ color: FN_COLOUR[animatingTo].text }}>{animatingTo.toUpperCase()}</span>
        </motion.div>
      )}
    </div>
  );
}
