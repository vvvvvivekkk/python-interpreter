'use client';

import Link from 'next/link';
import Pixi from '@/components/Pixi';
import TypeSort from '@/components/practice/TypeSort';
import SpotTheClue from '@/components/practice/SpotTheClue';

/**
 * Dedicated Data Types workout — int / float / string.
 * Built because the student's dad said he needs more practice here
 * after the paper worksheet on integers/floats/strings.
 */

export default function DataTypesPracticePage() {
  return (
    <div className="space-y-5 pb-20">
      <div className="rounded-3xl border-4 border-pink bg-white/90 p-5 shadow-chunk">
        <div className="flex items-start gap-3">
          <Pixi size={72} />
          <div className="flex-1">
            <div className="font-display text-xs font-bold uppercase tracking-wider text-pink-dark">
              Featured workout
            </div>
            <h1 className="font-display text-2xl font-bold text-navy">
              Data Types — int, float &amp; string
            </h1>
            <p className="mt-1 font-display text-sm font-semibold text-purple-dark">
              Three types. Three clues. Spot them, sort them, master them!
            </p>
          </div>
          <Link
            href="/practice"
            className="chunk-btn rounded-full border-2 border-purple-light bg-white px-3 py-2 font-display text-sm font-bold text-purple-dark"
          >
            ⬅ Practice Hub
          </Link>
        </div>
      </div>

      {/* 1. Rulebook */}
      <section className="rounded-3xl border-4 border-purple-light bg-white p-5 shadow-chunk">
        <h2 className="font-display text-xl font-bold text-pink-dark">📖 The three clues</h2>
        <p className="mt-1 text-sm font-semibold text-purple-dark">
          Every number or word has a TYPE. Here&apos;s how to tell:
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border-[3px] border-pink-dark bg-pink-light/30 p-3">
            <div className="text-3xl">🔢</div>
            <div className="mt-1 font-display text-lg font-bold text-pink-dark">INTEGER</div>
            <div className="mt-1 text-xs font-semibold text-pink-dark">
              Whole number. NO dot. NO quotes.
            </div>
            <div className="mt-2 rounded-md bg-navy p-2 font-code text-sm text-[#FFEEC2]">
              5<br />100<br />-4
            </div>
          </div>
          <div className="rounded-2xl border-[3px] border-purple bg-purple-light/30 p-3">
            <div className="text-3xl">🌊</div>
            <div className="mt-1 font-display text-lg font-bold text-purple-dark">FLOAT</div>
            <div className="mt-1 text-xs font-semibold text-purple-dark">
              Has a <b>dot .</b> No quotes.
            </div>
            <div className="mt-2 rounded-md bg-navy p-2 font-code text-sm text-[#FFEEC2]">
              2.5<br />3.14<br />8.0
            </div>
          </div>
          <div className="rounded-2xl border-[3px] border-sun bg-sun/30 p-3">
            <div className="text-3xl">💬</div>
            <div className="mt-1 font-display text-lg font-bold" style={{ color: '#D89520' }}>
              STRING
            </div>
            <div className="mt-1 text-xs font-semibold" style={{ color: '#D89520' }}>
              Has quotes <b>&quot; &quot;</b>
            </div>
            <div className="mt-2 rounded-md bg-navy p-2 font-code text-sm text-[#FFEEC2]">
              &quot;hi&quot;<br />&quot;5&quot;<br />&quot;2.5&quot;
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border-2 border-purple-light bg-cream p-3 font-display text-sm font-semibold">
          💡 <b>Tricky!</b> <span className="font-code">&quot;5&quot;</span> looks like a number
          but it has quotes — so it&apos;s a <b>string</b>. And{' '}
          <span className="font-code">5.0</span> looks like 5, but the dot makes it a{' '}
          <b>float</b>!
        </div>
      </section>

      {/* 2. The sort game */}
      <TypeSort />

      {/* 3. Spot the clue */}
      <section className="rounded-3xl border-4 border-sky bg-white p-5 shadow-chunk">
        <h2 className="font-display text-xl font-bold text-pink-dark">🔍 Spot the clue</h2>
        <p className="mt-1 text-sm font-semibold text-purple-dark">
          Every type leaves a <i>clue</i>. Tap every quote or dot you can find!
        </p>
        <div className="mt-3 space-y-3">
          <SpotTheClue line={'print("Hello Pixi")'} hunt='"' label='Tap every QUOTE (") — this makes it a STRING' />
          <SpotTheClue line={'name = "Ava"'} hunt='"' label='Tap every QUOTE (")' />
          <SpotTheClue line={'price = 2.5'} hunt='.' label='Tap every DOT (.) — this makes it a FLOAT' />
          <SpotTheClue line={'a = 3.14  b = 8.0  c = 0.5'} hunt='.' label='Tap every DOT (.) in all three floats' />
        </div>
      </section>

      {/* 4. Number line */}
      <section className="rounded-3xl border-4 border-mint bg-white p-5 shadow-chunk">
        <h2 className="font-display text-xl font-bold text-pink-dark">🔢 The number line</h2>
        <p className="mt-1 text-sm font-semibold text-purple-dark">
          Integers live on the big numbers. Floats live between them!
        </p>
        <div className="mt-4 rounded-2xl border-2 border-mint bg-[#E8FBF3] p-4">
          {/* SVG number line */}
          <svg viewBox="0 0 400 100" className="w-full" preserveAspectRatio="xMidYMid meet">
            {/* axis */}
            <line x1="20" y1="60" x2="380" y2="60" stroke="#059873" strokeWidth="2" />
            {/* integer ticks */}
            {[0, 1, 2, 3, 4, 5].map((n) => {
              const x = 20 + n * 72;
              return (
                <g key={n}>
                  <line x1={x} y1="55" x2={x} y2="75" stroke="#E22E73" strokeWidth="3" />
                  <circle cx={x} cy="60" r="5" fill="#E22E73" />
                  <text x={x} y="92" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="14" fontWeight="700" fill="#1a1a2e">
                    {n}
                  </text>
                </g>
              );
            })}
            {/* some floats between */}
            {[
              { v: 0.5, x: 56 },
              { v: 1.5, x: 128 },
              { v: 2.5, x: 200 },
              { v: 3.14, x: 246 },
              { v: 4.0, x: 308 },
            ].map((f, i) => (
              <g key={i}>
                <circle cx={f.x} cy="60" r="4" fill="#9D4EDD" />
                <text x={f.x} y="35" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" fill="#7A1AC9">
                  {f.v}
                </text>
                <line x1={f.x} y1="40" x2={f.x} y2="56" stroke="#9D4EDD" strokeWidth="1" strokeDasharray="2,2" />
              </g>
            ))}
            <text x="20" y="18" fontFamily="Fredoka" fontSize="12" fontWeight="700" fill="#7A1AC9">
              ← floats (purple) sit between integers →
            </text>
            <text x="20" y="105" fontFamily="Fredoka" fontSize="12" fontWeight="700" fill="#E22E73">
              ← integers (pink) are the big tick marks →
            </text>
          </svg>
        </div>
        <div className="mt-3 rounded-2xl border-2 border-mint bg-mint/10 p-3 font-display text-sm font-semibold">
          💡 Between 2 and 3 there are <b>infinite</b> floats — 2.1, 2.5, 2.999, 2.00001…!
        </div>
      </section>

      {/* 5. Conversion demo */}
      <section className="rounded-3xl border-4 border-sun bg-white p-5 shadow-chunk">
        <h2 className="font-display text-xl font-bold text-pink-dark">🔄 Convert between types</h2>
        <p className="mt-1 text-sm font-semibold text-purple-dark">
          Python has three magic words to CHANGE type: <span className="font-code">int()</span>,{' '}
          <span className="font-code">float()</span> and{' '}
          <span className="font-code">str()</span>.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { fn: 'int("5")',   out: '5',    note: 'string → integer' },
            { fn: 'int(2.7)',   out: '2',    note: 'float → integer (chops the dot part!)' },
            { fn: 'float(5)',   out: '5.0',  note: 'integer → float (adds .0)' },
            { fn: 'float("3.14")', out: '3.14', note: 'string → float' },
            { fn: 'str(5)',     out: '"5"',  note: 'integer → string (now has quotes)' },
            { fn: 'str(2.5)',   out: '"2.5"', note: 'float → string' },
          ].map((e) => (
            <div key={e.fn} className="rounded-2xl border-2 border-sun bg-cream p-3">
              <div className="rounded-md bg-navy p-2 font-code text-sm text-[#FFEEC2]">
                print({e.fn})
              </div>
              <div className="mt-2 font-display text-xs font-semibold text-purple-dark">
                Pixi shows → <span className="font-code text-base font-bold text-mint-dark">{e.out}</span>
              </div>
              <div className="mt-1 text-xs italic text-purple-dark/70">{e.note}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-2xl border-2 border-sun bg-sun/10 p-3 font-display text-sm font-semibold">
          💡 <b>Why?</b> input() always gives a string. If you want to add it as a number, you
          have to <span className="font-code">int(...)</span> it first!
        </div>
      </section>

      {/* Final tip */}
      <section className="rounded-3xl border-4 border-purple bg-gradient-to-br from-purple-light/20 to-white p-5 shadow-chunk">
        <div className="flex items-start gap-3">
          <div className="text-4xl">🏆</div>
          <div>
            <h2 className="font-display text-xl font-bold text-purple-dark">You&apos;re a type detective!</h2>
            <p className="mt-1 font-display font-semibold text-navy">
              When you see something new, ask yourself three things:
            </p>
            <ol className="mt-2 ml-4 list-decimal font-display text-sm font-semibold text-navy">
              <li>Does it have <b>quotes &quot; &quot;</b> ? → it&apos;s a STRING</li>
              <li>Does it have a <b>dot .</b> ? → it&apos;s a FLOAT</li>
              <li>Neither? → it&apos;s an INTEGER</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
