'use client';

import Link from 'next/link';
import lessonsData from '@/content/lessons.json';
import { useAppStore } from '@/lib/store';
import { Sfx } from '@/lib/sounds';

interface LessonSummary {
  week: number;
  title: string;
  concept: string;
  intro: string;
}

const ICONS = ['👋', '📦', '🎨', '🎁', '🔁', '📜', '💬', '✨'];
const GRADIENTS = [
  'from-[#FF7AAD] to-pink',
  'from-[#C8A4FF] to-purple',
  'from-[#7FE2C8] to-mint',
  'from-[#FFE066] to-sun',
  'from-[#B07CFF] to-purple-dark',
  'from-[#7FD1EC] to-sky',
  'from-[#FFB088] to-coral',
  'from-[#FFD6F5] to-pink-dark',
];

export default function LessonsIndexPage() {
  const lessons = lessonsData as LessonSummary[];
  const weeksDone = useAppStore((s) => s.weeksDone);
  const currentWeek = useAppStore((s) => s.currentWeek);

  return (
    <div className="pb-20">
      <div className="mb-4 rounded-3xl border-4 border-purple-light bg-white/90 p-5 shadow-chunk">
        <h1 className="font-display text-3xl font-bold text-navy">🗺️ Your 8-Week Adventure</h1>
        <p className="mt-1 font-display font-semibold text-purple-dark">
          Pick any week! You can jump around any time.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((l, i) => {
          const done = !!weeksDone[l.week];
          const current = l.week === currentWeek && !done;
          const ribbon = done ? '✅' : current ? '👉' : null;
          return (
            <Link
              key={l.week}
              href={`/lesson/${l.week}`}
              onClick={() => Sfx.click()}
              onMouseEnter={() => Sfx.hover()}
              className={`chunk-btn relative overflow-hidden rounded-3xl border-[3px] p-5 shadow-chunk ${
                done
                  ? 'border-mint bg-[#E8FBF3]'
                  : current
                    ? 'border-pink bg-[#FFF0F6]'
                    : 'border-[#FFE1B8] bg-white'
              }`}
            >
              {ribbon ? (
                <span className="absolute right-3 top-3 text-2xl">{ribbon}</span>
              ) : null}
              <div className="font-display text-xs font-bold uppercase tracking-wider text-purple-dark">
                Week {l.week}{current ? ' · this week' : ''}
              </div>
              <div
                className={`mt-2 inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-3xl text-white shadow-md ${GRADIENTS[i % GRADIENTS.length]}`}
              >
                {ICONS[i % ICONS.length]}
              </div>
              <h2 className="mt-2 font-display text-xl font-bold text-navy">{l.title}</h2>
              <span className="mt-1 inline-block rounded-md bg-purple-light/40 px-2 py-0.5 font-code text-xs font-bold text-purple-dark">
                {l.concept}
              </span>
              <p className="mt-2 font-display text-sm font-semibold text-purple-dark">{l.intro}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
