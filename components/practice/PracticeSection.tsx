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
import { useAppStore } from '@/lib/store';
import { Printer, Lock } from 'lucide-react';

interface Props {
  week: number;
  /** true when the student has reached the last lesson step */
  unlocked?: boolean;
}

interface PracticeEntry {
  week: number;
  fillBlanks: FillBlanksData;             // legacy single (kept for PDF compat)
  fillBlanksMore?: FillBlanksData[];      // extra fill-in-blanks rounds
  matchPairs: Pair[];                      // legacy single round
  matchRounds?: Pair[][];                  // extra match rounds
  colourBoxes: ColourBoxesData;
  drawIt: DrawItData;
  challenge: ChallengeData;
}

export default function PracticeSection({ week, unlocked = true }: Props) {
  const entry = (practiceData as PracticeEntry[]).find((p) => p.week === week);
  const lesson = (lessonsData as Array<{ week: number; title: string; concept: string }>).find((l) => l.week === week);
  const weeksDone = useAppStore((s) => s.weeksDone);
  const [printing, setPrinting] = useState(false);

  if (!entry || !lesson) return null;

  // Practice opens either when the lesson page tells us to, or if the week was done before.
  const isOpen = unlocked || !!weeksDone[week];

  if (!isOpen) {
    return (
      <section
        id="practice"
        className="rounded-3xl border-4 border-dashed border-pink-light bg-white/70 p-5 text-center shadow-chunk scroll-mt-24"
      >
        <div className="mx-auto flex max-w-md flex-col items-center gap-2">
          <Pixi size={64} />
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-light/30 px-4 py-2 font-display text-base font-bold text-pink-dark">
            <Lock size={18} /> Practice is locked
          </div>
          <p className="font-display text-base font-semibold text-purple-dark">
            🎓 Finish today&apos;s class first — tap <span className="rounded-md bg-sky px-2 py-0.5 text-white">Next</span> through all the steps.
          </p>
          <p className="text-sm font-semibold text-navy/70">
            Then 🎯 Practice Time will open with 5 fun games!
          </p>
        </div>
      </section>
    );
  }


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
    <section id="practice" className="rounded-3xl border-4 border-pink bg-gradient-to-br from-pink-light/20 to-white p-5 shadow-chunk scroll-mt-24">
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

      <div className="mt-5 space-y-6">
        {/* ─── Fill in the blanks ─── */}
        <section>
          <h3 className="mb-2 font-display text-lg font-bold text-purple-dark">
            ✏️ Fill in the blanks
          </h3>
          <div className="space-y-3">
            <FillBlanks data={entry.fillBlanks} />
            {(entry.fillBlanksMore ?? []).map((f, i) => (
              <div key={i}>
                <div className="mb-1 font-display text-sm font-bold text-pink-dark">
                  Round {i + 2}
                </div>
                <FillBlanks data={f} />
              </div>
            ))}
          </div>
        </section>

        {/* ─── Match pairs ─── */}
        <section>
          <h3 className="mb-2 font-display text-lg font-bold text-purple-dark">
            🧵 Match the pairs
          </h3>
          <div className="space-y-4">
            <MatchPairs pairs={entry.matchPairs} />
            {(entry.matchRounds ?? []).map((pairs, i) => (
              <div key={i}>
                <div className="mb-1 font-display text-sm font-bold text-pink-dark">
                  Round {i + 2}
                </div>
                <MatchPairs pairs={pairs} />
              </div>
            ))}
          </div>
        </section>

        <ColourBoxes data={entry.colourBoxes} />
        <DrawIt data={entry.drawIt} />
        <Challenge data={entry.challenge} />
      </div>
    </section>
  );
}
