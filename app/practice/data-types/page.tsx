'use client';

import Link from 'next/link';
import Pixi from '@/components/Pixi';
import TypeSort from '@/components/practice/TypeSort';
import InteractiveConvert from '@/components/practice/InteractiveConvert';
import CircleType from '@/components/practice/CircleType';
import MatchPairs from '@/components/practice/MatchPairs';
import FillBlanks from '@/components/practice/FillBlanks';
import ChooseAnswer from '@/components/practice/ChooseAnswer';

/**
 * Dedicated Data Types workout — int / float / string.
 * Built because the student's dad asked for extra practice here.
 */

export default function DataTypesPracticePage() {
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
            ⬅ Hub
          </Link>
        </div>
      </div>

      {/* 1. The rulebook */}
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

      {/* 2. Sort into houses */}
      <TypeSort />

      {/* 3. Convert (interactive) */}
      <InteractiveConvert />

      {/* 4. Circle-only hunts (worksheet-style) */}
      <section>
        <h2 className="mb-2 font-display text-lg font-bold text-pink-dark">
          🎯 Hunt rounds
        </h2>
        <div className="space-y-3">
          <CircleType
            hunt="int"
            items={[
              { label: '5', type: 'int' },
              { label: '"5"', type: 'str' },
              { label: '3.14', type: 'float' },
              { label: '7', type: 'int' },
              { label: '"hello"', type: 'str' },
              { label: '-2', type: 'int' },
              { label: '0', type: 'int' },
              { label: '"0"', type: 'str' },
              { label: '8.5', type: 'float' },
              { label: '100', type: 'int' },
              { label: '"five"', type: 'str' },
              { label: '1.0', type: 'float' },
            ]}
          />
          <CircleType
            hunt="str"
            items={[
              { label: '"cat"', type: 'str' },
              { label: '42', type: 'int' },
              { label: '"42"', type: 'str' },
              { label: '3.0', type: 'float' },
              { label: '"3.0"', type: 'str' },
              { label: '"True"', type: 'str' },
              { label: 'pixi', type: 'int' },
              { label: '"pixi"', type: 'str' },
              { label: '-1', type: 'int' },
              { label: '"-1"', type: 'str' },
              { label: '"🐱"', type: 'str' },
              { label: '0.5', type: 'float' },
            ]}
          />
          <CircleType
            hunt="float"
            items={[
              { label: '2.5', type: 'float' },
              { label: '"2.5"', type: 'str' },
              { label: '100', type: 'int' },
              { label: '3.14', type: 'float' },
              { label: '0.0', type: 'float' },
              { label: '8', type: 'int' },
              { label: '-1.5', type: 'float' },
              { label: '"0.1"', type: 'str' },
              { label: '7.0', type: 'float' },
              { label: '0', type: 'int' },
              { label: '12.75', type: 'float' },
              { label: '"7.0"', type: 'str' },
            ]}
          />
        </div>
      </section>

      {/* 5. Fill in the blanks — themed */}
      <section>
        <h2 className="mb-2 font-display text-lg font-bold text-pink-dark">
          🧩 Fill in the blanks — about YOU and the world
        </h2>
        <div className="space-y-3">
          <FillBlanks
            data={{
              template: 'age = {0}\nprint("I am", age)',
              expectedOutput: 'I am 5\n',
              blanks: [{ answer: '5', options: ['5', '"5"', 'True'] }],
            }}
          />
          <FillBlanks
            data={{
              template: 'best_friend = {0}\nprint("Hi,", best_friend)',
              expectedOutput: 'Hi, Ava\n',
              blanks: [{ answer: '"Ava"', options: ['"Ava"', 'Ava', '5'] }],
            }}
          />
          <FillBlanks
            data={{
              template: 'grade = {0}\nprint("Class:", grade)',
              expectedOutput: 'Class: 3\n',
              blanks: [{ answer: '3', options: ['3', '"3"', '3.0'] }],
            }}
          />
          <FillBlanks
            data={{
              template: 'price = {0}\nprint("Candy costs", price)',
              expectedOutput: 'Candy costs 2.5\n',
              blanks: [{ answer: '2.5', options: ['2.5', '"2.5"', '2']}],
            }}
          />
          <FillBlanks
            data={{
              template: 'element = {0}\nprint("Element:", element)',
              expectedOutput: 'Element: H\n',
              blanks: [{ answer: '"H"', options: ['"H"', 'H', '1'] }],
            }}
          />
          <FillBlanks
            data={{
              template: 'atomic_number = {0}\nmass = {1}\nprint(atomic_number, mass)',
              expectedOutput: '1 1.008\n',
              blanks: [
                { answer: '1', options: ['1', '"1"', '1.0'] },
                { answer: '1.008', options: ['1.008', '"1.008"', '1'] },
              ],
            }}
          />
          <FillBlanks
            data={{
              template: 'pet = {0}\nis_fluffy = {1}\nprint(pet, is_fluffy)',
              expectedOutput: 'cat True\n',
              blanks: [
                { answer: '"cat"', options: ['"cat"', 'cat', '5'] },
                { answer: 'True', options: ['True', '"True"', '1'] },
              ],
            }}
          />
        </div>
      </section>

      {/* 6. Choose the correct answer — quiz */}
      <section>
        <h2 className="mb-2 font-display text-lg font-bold text-pink-dark">
          ❓ Choose the correct answer
        </h2>
        <div className="space-y-3">
          <ChooseAnswer
            q={{
              question: 'What TYPE is this value?',
              code: '5',
              options: ['INTEGER', 'FLOAT', 'STRING'],
              correct: 0,
              hint: 'No dot, no quotes — just a whole number!',
              explain: 'No quotes + no dot = integer.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'What TYPE is this value?',
              code: '"5"',
              options: ['INTEGER', 'STRING', 'FLOAT'],
              correct: 1,
              hint: 'Look carefully — those are QUOTES around the 5!',
              explain: 'Quotes always make it a string, even if the inside looks like a number.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'What TYPE is this value?',
              code: '2.5',
              options: ['INTEGER', 'FLOAT', 'STRING'],
              correct: 1,
              hint: 'There is a tiny DOT in there!',
              explain: 'A dot (.) between numbers means float.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'Which one is a STRING?',
              options: ['3.14', '"hi"', '42'],
              correct: 1,
              hint: 'Look for the quotes " "!',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'Which one is a FLOAT?',
              options: ['"7"', '7', '7.0'],
              correct: 2,
              hint: 'Floats have a DOT and no quotes.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'Which one is NOT a string?',
              options: ['"cat"', '5', '"5"'],
              correct: 1,
              hint: 'The one WITHOUT quotes is not a string.',
              explain: '5 (no quotes) is an integer, not a string.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'What will Pixi show for this code?',
              code: 'print(2 + 3)',
              options: ['5', '"5"', '2+3'],
              correct: 0,
              hint: '2 plus 3 is a number — no quotes around it!',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'What TYPE do you get from int("7")?',
              options: ['INTEGER', 'STRING', 'FLOAT'],
              correct: 0,
              hint: 'int() TURNS something into an integer!',
              explain: 'int() is the magic word that makes an integer.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'What TYPE do you get from float(5)?',
              options: ['INTEGER', 'STRING', 'FLOAT'],
              correct: 2,
              hint: 'float() TURNS something into a float!',
              explain: 'float() always gives you a float with a dot.',
            }}
          />
          <ChooseAnswer
            q={{
              question: 'Chemistry time! What TYPE is 1.008 (hydrogen&apos;s mass)?',
              options: ['INTEGER', 'FLOAT', 'STRING'],
              correct: 1,
              hint: 'It has a dot — that makes it a what?',
              explain: 'All atomic masses are floats because they are never whole numbers.',
            }}
          />
        </div>
      </section>

      {/* 7. More matches (drag-line) */}
      <section>
        <h2 className="mb-2 font-display text-lg font-bold text-pink-dark">
          🎯 Drag-and-match rounds
        </h2>
        <div className="space-y-3">
          <MatchPairs
            pairs={[
              { code: '5',       output: 'INTEGER' },
              { code: '"hello"', output: 'STRING' },
              { code: '3.14',    output: 'FLOAT' },
              { code: '"5"',     output: 'STRING (looks like a number!)' },
              { code: '0.0',     output: 'FLOAT (yes, even 0.0!)' },
            ]}
          />
          <MatchPairs
            pairs={[
              { code: 'age = 5',          output: 'INTEGER box' },
              { code: 'name = "Ava"',     output: 'STRING box' },
              { code: 'price = 2.5',      output: 'FLOAT box' },
              { code: 'pet = "unicorn"',  output: 'STRING box' },
            ]}
          />
          <MatchPairs
            pairs={[
              { code: 'int("5")',    output: '5' },
              { code: 'float(5)',    output: '5.0' },
              { code: 'str(5)',      output: '"5"' },
              { code: 'int(2.7)',    output: '2' },
            ]}
          />
        </div>
      </section>

      {/* 8. Closer */}
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
