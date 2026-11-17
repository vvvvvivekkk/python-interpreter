'use client';

/**
 * FillElementVariables — fill-in-the-blank practice using real element data.
 * Reinforces int / float / string with a chemistry theme.
 */

import FillBlanks from './FillBlanks';

const EXERCISES = [
  // Hydrogen
  {
    label: 'Make the Hydrogen variables',
    data: {
      template: 'atomic_number = {0}\nsymbol = {1}\nmass = {2}\nprint(symbol, atomic_number, mass)',
      expectedOutput: 'H 1 1.008\n',
      blanks: [
        { answer: '1', options: ['1', '"1"', '1.0'] },
        { answer: '"H"', options: ['"H"', 'H', '1'] },
        { answer: '1.008', options: ['1.008', '"1.008"', '1'] },
      ],
    },
  },
  // Oxygen
  {
    label: 'Make the Oxygen variables',
    data: {
      template: 'symbol = {0}\nmass = {1}\nprint("You breathe", symbol)',
      expectedOutput: 'You breathe O\n',
      blanks: [
        { answer: '"O"', options: ['"O"', 'O', '8'] },
        { answer: '15.999', options: ['15.999', '"15.999"', '16'] },
      ],
    },
  },
  // Gold
  {
    label: 'Make the Gold variables',
    data: {
      template: 'symbol = {0}\nname = {1}\natomic_number = {2}\nprint(name, symbol)',
      expectedOutput: 'Gold Au\n',
      blanks: [
        { answer: '"Au"', options: ['"Au"', 'Au', '79'] },
        { answer: '"Gold"', options: ['"Gold"', 'Gold', 'G'] },
        { answer: '79', options: ['79', '"79"', '79.0'] },
      ],
    },
  },
  // Carbon
  {
    label: 'Make the Carbon variables',
    data: {
      template: 'element = {0}\nfact = {1}\nprint(element, fact)',
      expectedOutput: 'Carbon diamonds!\n',
      blanks: [
        { answer: '"Carbon"', options: ['"Carbon"', 'Carbon', '6'] },
        { answer: '"diamonds!"', options: ['"diamonds!"', 'diamonds!', '"6"'] },
      ],
    },
  },
];

export default function FillElementVariables() {
  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-bold text-pink-dark">
        🧪 Fill in the element variables
      </h2>
      <p className="mb-3 text-sm font-semibold text-purple-dark">
        Each element has an integer, a string, and a float — pick the right type for each blank!
      </p>
      <div className="space-y-3">
        {EXERCISES.map((e, i) => (
          <div key={i}>
            <div className="mb-1 font-display text-sm font-bold text-purple-dark">
              {e.label}
            </div>
            <FillBlanks data={e.data} />
          </div>
        ))}
      </div>
    </section>
  );
}
