'use client';

/**
 * GuessElementGame — Pixi gives a fun-fact clue about an element.
 * Kid taps one of 3 element tiles. Correct = Pixi cheers + star.
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import elementsData from '@/content/elements.json';
import { Sfx } from '@/lib/sounds';
import { burst } from '@/components/ConfettiBurst';
import { useAppStore } from '@/lib/store';
import { speak } from '@/lib/speak';

interface Element { n: number; sym: string; name: string; fact: string }

const CAT_COLOURS = ['#FFC9E0', '#F4ECFF', '#FFF8D5', '#E8FBF3', '#E3F6FF'];

function pickN<T>(arr: T[], n: number, must?: T): T[] {
  const pool = arr.slice();
  const out: T[] = [];
  if (must) {
    out.push(must);
    const i = pool.indexOf(must);
    if (i >= 0) pool.splice(i, 1);
  }
  while (out.length < n && pool.length > 0) {
    const j = Math.floor(Math.random() * pool.length);
    out.push(pool[j]);
    pool.splice(j, 1);
  }
  // shuffle again so answer isn't always first
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function GuessElementGame() {
  const elements = elementsData as Element[];
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const addStars = useAppStore((s) => s.addStars);

  const target = useMemo(() => elements[round % elements.length], [elements, round]);
  const options = useMemo(() => pickN(elements, 3, target), [elements, round, target]);

  const pick = (e: Element) => {
    if (picked !== null) return;
    Sfx.click();
    setPicked(e.n);
    if (e.n === target.n) {
      Sfx.success();
      burst({ count: 30 });
      addStars(1);
      setScore((s) => s + 1);
      speak(`Yes! ${target.name}. ${target.fact}`);
    } else {
      Sfx.puzzleWrong();
      speak(`Nope! The answer was ${target.name}.`);
    }
  };

  const next = () => {
    Sfx.click();
    setPicked(null);
    setRound((r) => r + 1);
  };

  return (
    <section className="rounded-3xl border-4 border-sky bg-white p-5 shadow-chunk">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-pink-dark">
          🔍 Which element is this?
        </h2>
        <span className="rounded-full border-2 border-sky bg-cream px-3 py-1 font-display text-sm font-bold" style={{ color: '#0E86AF' }}>
          Score: {score}
        </span>
      </div>

      <div className="mt-3 rounded-2xl border-2 border-purple-light bg-gradient-to-br from-[#F4ECFF] to-cream p-4">
        <div className="font-display text-sm font-bold text-purple-dark">🤖 Pixi says:</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={target.n}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-1 font-display text-lg font-bold text-navy"
          >
            &quot;{target.fact}&quot;
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((e, i) => {
          const isPicked = picked === e.n;
          const isRight = picked !== null && e.n === target.n;
          const isWrongPick = isPicked && e.n !== target.n;
          return (
            <motion.button
              key={e.n}
              disabled={picked !== null}
              onClick={() => pick(e)}
              onMouseEnter={() => Sfx.hover()}
              animate={isWrongPick ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              className="chunk-btn rounded-2xl border-[3px] p-4 text-center shadow-chunk transition"
              style={{
                background: isRight ? '#E8FBF3' : isWrongPick ? '#FFE0E8' : CAT_COLOURS[i % CAT_COLOURS.length],
                borderColor: isRight ? '#06D6A0' : isWrongPick ? '#FF8E72' : '#CFC3DF',
              }}
            >
              <div className="font-display text-3xl font-bold text-navy">{e.sym}</div>
              <div className="mt-1 font-display text-sm font-bold text-navy">{e.name}</div>
              <div className="mt-1 font-code text-xs text-purple-dark">#{e.n}</div>
            </motion.button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-3 flex items-center justify-between rounded-2xl border-2 border-mint bg-mint/10 p-3">
          <span className="font-display text-sm font-bold text-navy">
            {picked === target.n
              ? `🎉 Right! It's ${target.name}! +1 ⭐`
              : `💡 The answer was ${target.name} (${target.sym}).`}
          </span>
          <button
            onClick={next}
            className="chunk-btn rounded-full bg-pink px-4 py-2 font-display text-sm font-bold text-white shadow-chunk-pink"
          >
            Next ➡
          </button>
        </div>
      )}
    </section>
  );
}
