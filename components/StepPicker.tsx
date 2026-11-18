'use client';

/**
 * StepPicker — horizontal pill-row of all sub-topics (steps) inside the current week.
 * Each pill shows the step number and (on hover) its title. Clicking jumps to it.
 */

import { Sfx } from '@/lib/sounds';
import type { LessonStep } from './LessonPane';

interface Props {
  steps: LessonStep[];
  currentStep: number;
  onPick: (idx: number) => void;
}

const kindColour: Record<string, string> = {
  recap: 'border-sun bg-[#FFF8D5] text-navy',
  teach: 'border-sky bg-sky/30 text-navy',
  try: 'border-mint bg-[#E8FBF3] text-mint-dark',
};

export default function StepPicker({ steps, currentStep, onPick }: Props) {
  if (!steps || steps.length <= 1) return null;

  return (
    <nav
      aria-label="Jump to a sub-topic"
      className="rounded-3xl border-4 border-sky bg-white/90 p-3 shadow-chunk"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="font-display text-sm font-bold uppercase tracking-wider text-sky-dark">
          📍 Today&apos;s sub-topics
        </span>
        <span className="font-display text-xs font-semibold text-purple-dark">
          ({steps.length} steps · tap any to jump)
        </span>
      </div>
      <ol className="flex items-stretch gap-2 overflow-x-auto pb-1">
        {steps.map((s, i) => {
          const active = i === currentStep;
          const kind = s.kind ?? 'teach';
          const base = kindColour[kind] ?? kindColour.teach;
          const title = s.title ?? `Step ${i + 1}`;
          return (
            <li key={i} className="shrink-0">
              <button
                onClick={() => { Sfx.click(); onPick(i); }}
                onMouseEnter={() => Sfx.hover()}
                title={title}
                aria-current={active ? 'step' : undefined}
                className={`chunk-btn flex min-w-[9rem] max-w-[14rem] flex-col items-start gap-1 rounded-2xl border-2 px-3 py-2 text-left ${
                  active
                    ? 'border-pink bg-pink text-white shadow-chunk-pink'
                    : base
                }`}
              >
                <span className="flex items-center gap-1 font-display text-sm font-bold">
                  <span className={`grid h-6 w-6 place-items-center rounded-full border-2 ${
                    active ? 'border-white bg-white/20 text-white' : 'border-navy/20 bg-white text-navy'
                  }`}>
                    {i + 1}
                  </span>
                  {kind === 'recap' ? '🔙' : kind === 'try' ? '🎮' : '📘'}
                </span>
                <span className={`font-display text-xs font-semibold leading-tight ${
                  active ? 'text-white' : 'text-navy'
                } line-clamp-2`}>
                  {title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
