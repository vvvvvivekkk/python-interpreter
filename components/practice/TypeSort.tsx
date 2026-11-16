'use client';

/**
 * TypeSort — tap a value, then tap the correct "house" (int / float / str).
 * The thing the dad asked for: reinforces WHY "5" (string) and 5 (int) and
 * 5.0 (float) are different. The clue pills under each house name the feature
 * the kid has to spot (quotes, dot, bare number).
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sfx } from '@/lib/sounds';
import { burst } from '@/components/ConfettiBurst';
import { useAppStore } from '@/lib/store';
import { speak } from '@/lib/speak';

type PyType = 'int' | 'float' | 'str';

interface Item { id: string; label: string; type: PyType }

const BANK: Item[] = [
  { id: 'a', label: '5',       type: 'int' },
  { id: 'b', label: '"5"',     type: 'str' },
  { id: 'c', label: '2.5',     type: 'float' },
  { id: 'd', label: '"hello"', type: 'str' },
  { id: 'e', label: '0',       type: 'int' },
  { id: 'f', label: '8.0',     type: 'float' },
  { id: 'g', label: '"2.5"',   type: 'str' },
  { id: 'h', label: '-4',      type: 'int' },
  { id: 'i', label: '3.14',    type: 'float' },
  { id: 'j', label: '"cat"',   type: 'str' },
  { id: 'k', label: '100',     type: 'int' },
  { id: 'l', label: '"-4"',    type: 'str' },
];

const HOUSES: { type: PyType; name: string; ico: string; clue: string; colour: string; bg: string; border: string }[] = [
  { type: 'int',   name: 'INTEGER', ico: '🔢', clue: 'whole number · no dot · no quotes', colour: '#E22E73', bg: '#FFC9E0', border: '#E22E73' },
  { type: 'float', name: 'FLOAT',   ico: '🌊', clue: 'has a dot · no quotes',             colour: '#7A1AC9', bg: '#F4ECFF', border: '#9D4EDD' },
  { type: 'str',   name: 'STRING',  ico: '💬', clue: 'has quotes " "',                     colour: '#D89520', bg: '#FFF8D5', border: '#E5A530' },
];

export default function TypeSort() {
  const [placed, setPlaced] = useState<Record<string, PyType>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const addStars = useAppStore((s) => s.addStars);

  const bank = useMemo(() => BANK.filter((it) => !placed[it.id]), [placed]);
  const allDone = Object.keys(placed).length === BANK.length;

  const tapItem = (id: string) => {
    if (placed[id]) return;
    Sfx.click();
    setPicked(id === picked ? null : id);
  };
  const tapHouse = (t: PyType) => {
    if (!picked) return;
    const item = BANK.find((it) => it.id === picked)!;
    if (item.type === t) {
      Sfx.success();
      setPlaced((p) => ({ ...p, [picked]: t }));
      setPicked(null);
      if (Object.keys(placed).length + 1 === BANK.length) {
        setTimeout(() => {
          burst({ count: 60 });
          addStars(2);
          speak('Super! All types sorted!');
        }, 200);
      }
    } else {
      Sfx.puzzleWrong();
      setWrong(t);
      speak(`Nope! ${item.label} is a ${item.type}.`);
      setTimeout(() => setWrong(null), 600);
    }
  };
  const reset = () => { setPlaced({}); setPicked(null); setWrong(null); };

  const counts: Record<PyType, number> = {
    int:   Object.values(placed).filter((t) => t === 'int').length,
    float: Object.values(placed).filter((t) => t === 'float').length,
    str:   Object.values(placed).filter((t) => t === 'str').length,
  };

  return (
    <div className="rounded-3xl border-4 border-pink bg-white p-5 shadow-chunk">
      <h3 className="font-display text-xl font-bold text-pink-dark">🏠 Sort into type houses</h3>
      <p className="mt-1 text-sm font-semibold text-purple-dark">
        Tap a value, then tap its HOUSE. Clues are under each house name!
      </p>

      {/* Three houses */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {HOUSES.map((h) => {
          const picks = BANK.filter((it) => placed[it.id] === h.type);
          const isWrong = wrong === h.type;
          const active = picked !== null;
          return (
            <button
              key={h.type}
              onClick={() => tapHouse(h.type)}
              disabled={!active}
              className={`rounded-3xl border-[3px] p-3 text-left transition ${
                isWrong ? 'animate-pulse' : ''
              }`}
              style={{
                background: h.bg,
                borderColor: isWrong ? '#FF8E72' : h.border,
                cursor: active ? 'pointer' : 'default',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{h.ico}</span>
                <div className="font-display text-lg font-bold" style={{ color: h.colour }}>
                  {h.name}
                </div>
                <span className="ml-auto font-display text-sm font-bold text-navy">
                  {counts[h.type]}
                </span>
              </div>
              <div className="mt-1 text-xs font-semibold" style={{ color: h.colour, opacity: 0.8 }}>
                {h.clue}
              </div>
              {/* Dropped-in items */}
              <div className="mt-2 flex min-h-[60px] flex-wrap gap-1 rounded-xl bg-white/50 p-2">
                <AnimatePresence>
                  {picks.map((it) => (
                    <motion.span
                      key={it.id}
                      layout
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="rounded-full border-2 bg-white px-2 py-0.5 font-code text-sm font-bold text-navy"
                      style={{ borderColor: h.border }}
                    >
                      {it.label}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bank */}
      <h4 className="mt-5 font-display text-sm font-bold uppercase text-purple-dark">
        Values to sort ({bank.length} left)
      </h4>
      <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border-2 border-dashed border-purple-light bg-cream p-3 min-h-[70px]">
        <AnimatePresence>
          {bank.map((it) => {
            const isPicked = picked === it.id;
            return (
              <motion.button
                key={it.id}
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                onClick={() => tapItem(it.id)}
                className={`rounded-full border-[3px] px-4 py-2 font-code text-base font-bold ${
                  isPicked
                    ? 'border-pink bg-pink text-white shadow-chunk-pink'
                    : 'border-purple-light bg-white text-navy hover:bg-pink-light/30'
                }`}
              >
                {it.label}
              </motion.button>
            );
          })}
        </AnimatePresence>
        {bank.length === 0 && (
          <div className="grid w-full place-items-center py-4 font-display font-bold text-mint-dark">
            🎉 All sorted! +2 ⭐ Super programmer!
          </div>
        )}
      </div>

      {allDone && (
        <div className="mt-3 text-center">
          <button
            onClick={reset}
            className="chunk-btn rounded-full border-2 border-purple-light bg-white px-5 py-2 font-display font-bold text-purple-dark"
          >
            ↺ Play again
          </button>
        </div>
      )}
    </div>
  );
}
