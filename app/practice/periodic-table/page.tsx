'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Pixi from '@/components/Pixi';
import elementsData from '@/content/elements.json';
import { Sfx } from '@/lib/sounds';
import { burst } from '@/components/ConfettiBurst';
import { useAppStore } from '@/lib/store';
import { speak } from '@/lib/speak';
import MatchPairs from '@/components/practice/MatchPairs';
import ChooseAnswer from '@/components/practice/ChooseAnswer';
import FillBlanks from '@/components/practice/FillBlanks';
import GuessElementGame from '@/components/practice/GuessElementGame';
import FillElementVariables from '@/components/practice/FillElementVariables';

interface Element {
  n: number;
  sym: string;
  name: string;
  mass: number;
  cat: 'nonmetal' | 'metal' | 'noble' | 'metalloid';
  row: number;
  col: number;
  fact: string;
}

// Colour per category — teaches kids to spot groups by colour.
const CAT_COLOUR: Record<Element['cat'], { bg: string; border: string; text: string }> = {
  nonmetal:  { bg: '#E8FBF3', border: '#06D6A0', text: '#059873' },
  metal:     { bg: '#FFC9E0', border: '#E22E73', text: '#C13D73' },
  noble:     { bg: '#F4ECFF', border: '#9D4EDD', text: '#7A1AC9' },
  metalloid: { bg: '#FFF8D5', border: '#E5A530', text: '#D89520' },
};

const CAT_NAME: Record<Element['cat'], string> = {
  nonmetal: 'Nonmetal',
  metal: 'Metal',
  noble: 'Noble gas',
  metalloid: 'In-between',
};

export default function PeriodicTablePage() {
  const elements = elementsData as Element[];
  const [picked, setPicked] = useState<Element>(elements[0]);
  const [typeAnswers, setTypeAnswers] = useState<Record<string, boolean>>({});
  const addStars = useAppStore((s) => s.addStars);

  const tableElements = elements.filter((e) => e.row > 0);
  const famous = elements.filter((e) => e.row === 0);

  const pick = (e: Element) => {
    Sfx.click();
    setPicked(e);
    setTypeAnswers({});
    speak(`${e.name}! ${e.fact}`);
  };

  const answerType = (attr: string, want: 'int' | 'float' | 'str', got: 'int' | 'float' | 'str') => {
    if (typeAnswers[attr]) return;
    const correct = want === got;
    if (correct) {
      Sfx.success();
      setTypeAnswers((p) => ({ ...p, [attr]: true }));
      const all = { ...typeAnswers, [attr]: true };
      if (Object.keys(all).length === 4) {
        setTimeout(() => {
          burst({ count: 40 });
          addStars(1);
          speak('Super! You know all the types!');
        }, 200);
      }
    } else {
      Sfx.puzzleWrong();
    }
  };

  // Attribute → expected type
  const attrs: { key: string; code: string; value: string; type: 'int' | 'float' | 'str'; label: string }[] = [
    { key: 'n',    code: 'atomic_number = ' + picked.n,            value: String(picked.n),         type: 'int',   label: 'atomic_number' },
    { key: 'sym',  code: 'symbol = "' + picked.sym + '"',          value: '"' + picked.sym + '"',   type: 'str',   label: 'symbol' },
    { key: 'name', code: 'name = "' + picked.name + '"',           value: '"' + picked.name + '"', type: 'str',   label: 'name' },
    { key: 'mass', code: 'mass = ' + picked.mass,                  value: String(picked.mass),      type: 'float', label: 'mass' },
  ];

  const cellSize = 42; // mm-ish feel at desktop; scales with vw on phones

  return (
    <div className="space-y-5 pb-20">
      {/* Hero */}
      <div className="rounded-3xl border-4 border-pink bg-white/90 p-5 shadow-chunk">
        <div className="flex items-start gap-3">
          <Pixi size={72} />
          <div className="flex-1">
            <div className="font-display text-xs font-bold uppercase tracking-wider text-pink-dark">
              Featured workout
            </div>
            <h1 className="font-display text-2xl font-bold text-navy">
              🧪 Python meets the Periodic Table!
            </h1>
            <p className="mt-1 font-display text-sm font-semibold text-purple-dark">
              Every element on the table is FOUR Python variables — an integer, a float, and two
              strings. Tap one and see!
            </p>
          </div>
          <Link
            href="/practice"
            className="chunk-btn rounded-full border-2 border-purple-light bg-white px-3 py-2 font-display text-sm font-bold text-purple-dark self-start"
          >
            ⬅ Hub
          </Link>
        </div>
      </div>

      {/* The Table */}
      <section className="rounded-3xl border-4 border-purple-light bg-white p-4 shadow-chunk">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-pink-dark">The first 18 elements</h2>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {(Object.keys(CAT_COLOUR) as Element['cat'][]).map((k) => (
              <span
                key={k}
                className="rounded-full border-2 px-2 py-0.5"
                style={{ background: CAT_COLOUR[k].bg, borderColor: CAT_COLOUR[k].border, color: CAT_COLOUR[k].text }}
              >
                {CAT_NAME[k]}
              </span>
            ))}
          </div>
        </div>

        {/* 18-column proper periodic table layout */}
        <div className="overflow-x-auto">
          <div
            className="mx-auto grid gap-[3px]"
            style={{
              gridTemplateColumns: `repeat(18, minmax(${cellSize * 0.7}px, 1fr))`,
              gridAutoRows: `${cellSize}px`,
              minWidth: `${18 * cellSize * 0.75}px`,
              maxWidth: '100%',
            }}
          >
            {tableElements.map((e) => {
              const c = CAT_COLOUR[e.cat];
              const active = picked.n === e.n;
              return (
                <button
                  key={e.n}
                  onClick={() => pick(e)}
                  onMouseEnter={() => Sfx.hover()}
                  className="chunk-btn rounded-md border-2 p-1 text-center transition-all"
                  style={{
                    gridColumn: e.col,
                    gridRow: e.row,
                    background: c.bg,
                    borderColor: active ? '#FF6B9D' : c.border,
                    boxShadow: active ? '0 0 0 3px #FF6B9D, 0 4px 0 #E22E73' : `0 3px 0 ${c.border}`,
                    color: c.text,
                  }}
                >
                  <div className="font-code text-[8px] font-bold leading-none text-navy/70">{e.n}</div>
                  <div className="font-display text-base font-bold leading-tight">{e.sym}</div>
                  <div className="font-display text-[7px] leading-none truncate">{e.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Famous elements (outside the first 18) */}
        <div className="mt-5">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-purple-dark">
            ⭐ Famous friends
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {famous.map((e) => {
              const c = CAT_COLOUR[e.cat];
              const active = picked.n === e.n;
              return (
                <button
                  key={e.n}
                  onClick={() => pick(e)}
                  onMouseEnter={() => Sfx.hover()}
                  className="chunk-btn rounded-md border-2 p-2 text-center"
                  style={{
                    background: c.bg,
                    borderColor: active ? '#FF6B9D' : c.border,
                    boxShadow: active ? '0 0 0 3px #FF6B9D, 0 4px 0 #E22E73' : `0 3px 0 ${c.border}`,
                    color: c.text,
                    minWidth: 72,
                  }}
                >
                  <div className="font-code text-[9px] font-bold text-navy/70">{e.n}</div>
                  <div className="font-display text-xl font-bold leading-tight">{e.sym}</div>
                  <div className="font-display text-[10px]">{e.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Picked element → Python variables */}
      <AnimatePresence mode="wait">
        <motion.section
          key={picked.n}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border-4 border-sun bg-gradient-to-br from-[#FFF8E7] to-white p-5 shadow-chunk"
        >
          <div className="flex flex-wrap items-start gap-4">
            <div
              className="grid flex-shrink-0 place-items-center rounded-3xl border-[4px] p-4 text-center"
              style={{
                background: CAT_COLOUR[picked.cat].bg,
                borderColor: CAT_COLOUR[picked.cat].border,
                minWidth: 120, minHeight: 120,
                color: CAT_COLOUR[picked.cat].text,
              }}
            >
              <div>
                <div className="font-code text-base font-bold">{picked.n}</div>
                <div className="font-display text-4xl font-bold leading-none">{picked.sym}</div>
                <div className="font-display text-sm mt-1">{picked.name}</div>
                <div className="font-code text-xs mt-1">{picked.mass}</div>
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="rounded-full bg-sun/30 border-2 border-sun px-3 py-1 inline-block text-xs font-display font-bold text-navy">
                ✨ Fun fact
              </div>
              <p className="mt-2 font-display text-base font-semibold text-navy">
                {picked.fact}
              </p>
              <p className="mt-3 font-display text-sm font-semibold text-purple-dark">
                As Python code, {picked.name} needs 4 variables — one of each type! Tap each
                variable to guess its type:
              </p>
            </div>
          </div>

          {/* Code with per-attribute type picker */}
          <div className="mt-4 rounded-2xl bg-navy p-4 font-code text-base leading-7 text-[#FFEEC2]">
            {attrs.map((a) => (
              <div key={a.key} className="flex flex-wrap items-center gap-2 py-1">
                <span className="text-[#E8A9FF]">{a.label.split(' = ')[0]}</span>
                <span className="text-[#F8F0FF]">=</span>
                <span className={a.type === 'int' ? 'text-[#8BF0C7]' : a.type === 'float' ? 'text-[#C8A4FF]' : 'text-[#FFB3D1]'}>
                  {a.value}
                </span>
                <span className="ml-auto flex flex-wrap items-center gap-1 text-xs">
                  {typeAnswers[a.key] ? (
                    <span className="rounded-full bg-mint px-2 py-0.5 font-display font-bold text-white">
                      ✓ {a.type.toUpperCase()} — right!
                    </span>
                  ) : (
                    <>
                      <span className="text-[#8B7FB8] font-display">this is a:</span>
                      {(['int', 'float', 'str'] as const).map((g) => (
                        <button
                          key={g}
                          onClick={() => answerType(a.key, a.type, g)}
                          className="rounded-full border-2 border-[#C8A4FF] bg-[#241548] px-2 py-0.5 font-display font-bold text-[#C8A4FF] hover:bg-[#9D4EDD] hover:text-white"
                        >
                          {g}
                        </button>
                      ))}
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>

          {Object.keys(typeAnswers).length === 4 && (
            <div className="mt-3 rounded-2xl border-2 border-mint bg-mint/10 p-3 font-display font-bold text-mint-dark">
              🎉 All 4 types right! +1 ⭐ You know your types!
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {/* GAME 1: Guess the element from its fun fact */}
      <GuessElementGame />

      {/* GAME 2: Fill the element variables */}
      <FillElementVariables />

      {/* GAME 3: Match symbol to name (drag-line) */}
      <section>
        <h2 className="mb-2 font-display text-lg font-bold text-pink-dark">
          🔗 Match the symbol to the name
        </h2>
        <p className="mb-2 text-sm font-semibold text-purple-dark">
          Drag a line from each symbol to its element name!
        </p>
        <div className="space-y-3">
          <MatchPairs
            pairs={[
              { code: 'H',  output: 'Hydrogen' },
              { code: 'He', output: 'Helium' },
              { code: 'O',  output: 'Oxygen' },
              { code: 'C',  output: 'Carbon' },
            ]}
          />
          <MatchPairs
            pairs={[
              { code: 'Au', output: 'Gold' },
              { code: 'Ag', output: 'Silver' },
              { code: 'Fe', output: 'Iron' },
              { code: 'Cu', output: 'Copper' },
            ]}
          />
          <MatchPairs
            pairs={[
              { code: 'Na', output: 'Sodium (salt!)' },
              { code: 'Cl', output: 'Chlorine (pool!)' },
              { code: 'Si', output: 'Silicon (chips!)' },
              { code: 'Al', output: 'Aluminum (cans!)' },
            ]}
          />
        </div>
      </section>

      {/* GAME 4: Multiple-choice quiz */}
      <section>
        <h2 className="mb-2 font-display text-lg font-bold text-pink-dark">
          ❓ Element quiz
        </h2>
        <div className="space-y-3">
          <ChooseAnswer
            q={{
              question: 'Which element lifts balloons and makes your voice squeaky?',
              options: ['Helium (He)', 'Iron (Fe)', 'Carbon (C)'],
              correct: 0,
              hint: 'It&apos;s a noble gas — very light!',
              explain: 'Helium! That&apos;s why you float balloons with it.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'Which element do you BREATHE in?',
              options: ['Gold (Au)', 'Oxygen (O)', 'Sulfur (S)'],
              correct: 1,
              hint: 'You breathe it every single second!',
              explain: 'Oxygen (O) — 21% of the air we breathe.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'Which element is TREASURE — shiny and never rusts?',
              options: ['Iron (Fe)', 'Sodium (Na)', 'Gold (Au)'],
              correct: 2,
              hint: 'Pirates love this one!',
              explain: 'Gold! It&apos;s so stable it never turns rusty.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'What is the SYMBOL for Hydrogen?',
              options: ['Hy', 'H', 'He'],
              correct: 1,
              hint: 'Just one letter — the FIRST letter!',
              explain: 'H — the very first element in the whole table.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'What TYPE is the atomic number 8 (Oxygen)?',
              code: 'atomic_number = 8',
              options: ['INTEGER', 'FLOAT', 'STRING'],
              correct: 0,
              hint: 'No dot, no quotes...',
              explain: 'Atomic numbers are always INTEGERS (whole numbers).',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'What TYPE is the atomic mass 1.008?',
              code: 'mass = 1.008',
              options: ['INTEGER', 'FLOAT', 'STRING'],
              correct: 1,
              hint: 'It has a dot!',
              explain: 'Atomic masses are always FLOATS — numbers with a decimal point.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'What TYPE is the element symbol "H"?',
              code: 'symbol = "H"',
              options: ['INTEGER', 'FLOAT', 'STRING'],
              correct: 2,
              hint: 'Those quotes " " give it away!',
              explain: 'Symbols are STRINGS — one letter in quotes.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'Carbon makes DIAMONDS — what&apos;s its symbol?',
              options: ['Ca', 'Ca', 'C'],
              correct: 2,
              hint: 'Just ONE letter — the first one!',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'Silicon is inside every computer chip. What&apos;s its symbol?',
              options: ['Si', 'Sn', 'S'],
              correct: 0,
              hint: 'TWO letters — big S, little i.',
            }}
          />
        </div>
      </section>

      {/* Why does this matter */}
      <section className="rounded-3xl border-4 border-sky bg-gradient-to-br from-[#E3F6FF] to-white p-5 shadow-chunk">
        <h2 className="font-display text-xl font-bold text-pink-dark">💡 Why this matters</h2>
        <p className="mt-2 font-display font-semibold text-navy">
          Real programmers use the periodic table in SCIENCE apps every day! When you grow up and
          build a chemistry app, every element will be <b>exactly these 4 variables</b>:
        </p>
        <ul className="mt-2 ml-5 list-disc font-display text-sm font-semibold text-navy">
          <li><b>atomic_number</b> → INTEGER (no dot, no quotes)</li>
          <li><b>symbol</b> → STRING (has quotes, like &quot;H&quot;)</li>
          <li><b>name</b> → STRING (has quotes, like &quot;Hydrogen&quot;)</li>
          <li><b>mass</b> → FLOAT (has a dot, like 1.008)</li>
        </ul>
        <p className="mt-3 font-display text-sm font-semibold text-purple-dark">
          ✨ You just learned a tiny bit of CHEMISTRY and PYTHON at the same time!
        </p>
      </section>
    </div>
  );
}
