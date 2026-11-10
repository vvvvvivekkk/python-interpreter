'use client';

import { useEffect, useState } from 'react';
import Pixi, { PixiState } from './Pixi';
import { speak } from '@/lib/speak';
import { Sfx } from '@/lib/sounds';

export interface LessonStep {
  text: string;
  pre?: string;    // pre-loaded code to put in the editor
  chips?: string[]; // chip inserts (one line each)
  kind?: 'recap' | 'teach' | 'try'; // visual marker on the step
}

export interface Lesson {
  week: number;
  title: string;
  concept: string;
  intro: string;
  steps: LessonStep[];
  mission?: { brief: string; starter?: string };
}

interface Props {
  lesson: Lesson;
  stepIdx: number;
  onNext: () => void;
  onBack?: () => void;
}

export default function LessonPane({ lesson, stepIdx, onNext, onBack }: Props) {
  const step = lesson.steps[stepIdx];
  const [pixiState, setPixiState] = useState<PixiState>('idle');

  useEffect(() => {
    if (!step) return;
    setPixiState('talking');
    speak(step.text, { onDone: () => setPixiState('idle') });
  }, [stepIdx, step]);

  if (!step) return null;

  const isRecap = step.kind === 'recap';
  return (
    <div className={`rounded-3xl border-4 bg-white/90 p-5 shadow-chunk ${
      isRecap ? 'border-sun' : 'border-purple-light'
    }`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-display text-sm font-bold uppercase tracking-wider text-purple-dark">
          Week {lesson.week} · {lesson.concept}
        </span>
        {isRecap ? (
          <span className="rounded-full bg-sun px-2 py-0.5 font-display text-xs font-bold text-navy">
            🔙 Recap
          </span>
        ) : null}
      </div>
      <h2 className="font-display text-2xl font-bold text-navy">{lesson.title}</h2>
      <div className="mt-3 flex items-start gap-3">
        <Pixi state={pixiState} size={64} onClick={() => speak(step.text)} />
        <p className="flex-1 font-display text-lg font-semibold leading-snug text-navy">
          {step.text}
        </p>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {onBack && stepIdx > 0 ? (
          <button
            onClick={() => { Sfx.click(); onBack(); }}
            className="chunk-btn rounded-full border-2 border-purple-light bg-cream px-4 py-2 font-display font-bold"
          >
            ⬅ Back
          </button>
        ) : null}
        <span className="flex-1 text-sm font-semibold text-purple-dark">
          Step {stepIdx + 1} of {lesson.steps.length}
        </span>
        <button
          onClick={() => { Sfx.click(); onNext(); }}
          className="chunk-btn rounded-full bg-pink px-6 py-3 font-display font-bold text-white shadow-chunk-pink"
        >
          {stepIdx === lesson.steps.length - 1 ? 'Finish ✨' : 'Next ➡️'}
        </button>
      </div>
    </div>
  );
}
