'use client';

import { useState } from 'react';
import practiceData from '@/content/practice.json';
import lessonsData from '@/content/lessons.json';
import FillBlanks, { FillBlanksData } from './FillBlanks';
import MatchPairs, { Pair } from './MatchPairs';
import ColourBoxes, { ColourBoxesData } from './ColourBoxes';
import DrawIt, { DrawItData } from './DrawIt';
import Challenge, { ChallengeData } from './Challenge';
import Pixi from '@/components/Pixi';
import { Sfx } from '@/lib/sounds';
import { Printer } from 'lucide-react';

interface Props { week: number }

interface PracticeEntry {
  week: number;
  fillBlanks: FillBlanksData;
  matchPairs: Pair[];
  colourBoxes: ColourBoxesData;
  drawIt: DrawItData;
  challenge: ChallengeData;
}

export default function PracticeSection({ week }: Props) {
  const entry = (practiceData as PracticeEntry[]).find((p) => p.week === week);
  const lesson = (lessonsData as Array<{ week: number; title: string; concept: string }>).find((l) => l.week === week);
  const [printing, setPrinting] = useState(false);

  if (!entry || !lesson) return null;

  const printWorksheet = async () => {
    Sfx.click();
    setPrinting(true);
    try {
      const { generateWorksheetPdf } = await import('@/lib/worksheetPdf');
      const doc = generateWorksheetPdf(entry, lesson);
      doc.save(`week-${week}-worksheet.pdf`);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <section className="rounded-3xl border-4 border-pink bg-gradient-to-br from-pink-light/20 to-white p-5 shadow-chunk">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-pink-dark">🎯 Practice Time!</h2>
          <div className="mt-1 flex items-start gap-2">
            <Pixi size={44} />
            <p className="flex-1 font-display text-base font-semibold text-navy">
              One more thing before we finish — let&apos;s play!
            </p>
          </div>
        </div>
        <button
          onClick={printWorksheet}
          className="chunk-btn inline-flex items-center gap-2 rounded-full border-2 border-pink bg-white px-4 py-3 font-display font-bold text-pink-dark shadow-chunk-pink"
          disabled={printing}
        >
          <Printer size={18} />
          {printing ? 'Preparing…' : '🖨️ Print worksheet'}
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <FillBlanks data={entry.fillBlanks} />
        <MatchPairs pairs={entry.matchPairs} />
        <ColourBoxes data={entry.colourBoxes} />
        <DrawIt data={entry.drawIt} />
        <Challenge data={entry.challenge} />
      </div>
    </section>
  );
}
