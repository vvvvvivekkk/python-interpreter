'use client';

/**
 * ChooseAnswer — standalone multiple-choice card.
 * Big buttons, 3-4 options, correct = confetti + star, wrong = shake + hint.
 * No "next" button — the card lives in place on the page and stays done.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sfx } from '@/lib/sounds';
import { burst } from '@/components/ConfettiBurst';
import { useAppStore } from '@/lib/store';
import { speak } from '@/lib/speak';

export interface ChoiceQuestion {
  question: string;
  code?: string;
  options: string[];
  correct: number;
  hint?: string;
  explain?: string; // optional short "why" shown after a correct answer
}

interface Props { q: ChoiceQuestion }

export default function ChooseAnswer({ q }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongShake, setWrongShake] = useState<number | null>(null);
  const addStars = useAppStore((s) => s.addStars);
  const done = picked === q.correct;

  const pick = (i: number) => {
    if (done) return;
    Sfx.click();
    if (i === q.correct) {
      setPicked(i);
      Sfx.success();
      burst({ count: 30 });
      addStars(1);
      speak('Yes! Super!');
    } else {
      Sfx.puzzleWrong();
      setWrongShake(i);
      setTimeout(() => setWrongShake(null), 500);
    }
  };

  return (
    <div className="rounded-3xl border-4 border-purple-light bg-white p-5 shadow-chunk">
      <div className="font-display text-base font-bold text-navy">
        {q.question}
      </div>
      {q.code ? (
        <div className="mt-2 rounded-xl bg-navy p-3 font-code text-base leading-6 text-[#FFEEC2] whitespace-pre-wrap">
          {q.code}
        </div>
      ) : null}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {q.options.map((o, i) => {
          const isRight = done && i === q.correct;
          const isShaking = wrongShake === i;
          return (
            <motion.button
              key={i}
              onClick={() => pick(i)}
              onMouseEnter={() => Sfx.hover()}
              disabled={done}
              animate={isShaking ? { x: [0, -6, 6, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`chunk-btn rounded-2xl border-[3px] p-3 text-center font-code text-base font-bold shadow-chunk ${
                isRight
                  ? 'border-mint bg-mint/30 text-mint-dark'
                  : done
                    ? 'border-purple-light bg-cream opacity-50'
                    : isShaking
                      ? 'border-coral bg-coral/20'
                      : 'border-purple-light bg-cream hover:bg-pink-light/30'
              }`}
            >
              {o}
            </motion.button>
          );
        })}
      </div>
      {done ? (
        <div className="mt-3 rounded-xl border-2 border-mint bg-mint/10 p-3 font-display text-sm font-bold text-mint-dark">
          🎉 Right! +1 ⭐
          {q.explain && <span className="ml-2 font-semibold text-navy">— {q.explain}</span>}
        </div>
      ) : wrongShake !== null && q.hint ? (
        <div className="mt-3 rounded-xl border-2 border-sun bg-sun/10 p-3 font-display text-sm font-semibold text-navy">
          💡 {q.hint}
        </div>
      ) : null}
    </div>
  );
}
