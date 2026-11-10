'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Sfx } from '@/lib/sounds';
import lessonsData from '@/content/lessons.json';

interface Props {
  currentWeek: number;
}

export default function WeekPicker({ currentWeek }: Props) {
  const weeksDone = useAppStore((s) => s.weeksDone);
  const weeks = (lessonsData as Array<{ week: number; title: string; concept: string }>);

  return (
    <nav
      aria-label="Jump to another week"
      className="flex items-center gap-2 overflow-x-auto rounded-3xl border-4 border-purple-light bg-white/90 p-2 shadow-chunk"
    >
      <Link
        href="/lessons"
        onClick={() => Sfx.click()}
        className="chunk-btn flex shrink-0 items-center gap-1 rounded-full border-2 border-purple-light bg-cream px-3 py-2 font-display text-sm font-bold text-purple-dark"
        aria-label="All lessons"
      >
        🗺️ All
      </Link>
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto">
        {weeks.map((w) => {
          const active = w.week === currentWeek;
          const done = !!weeksDone[w.week];
          return (
            <Link
              key={w.week}
              href={`/lesson/${w.week}`}
              onClick={() => Sfx.click()}
              onMouseEnter={() => Sfx.hover()}
              title={`Week ${w.week}: ${w.title}`}
              aria-current={active ? 'page' : undefined}
              className={`chunk-btn grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 font-display font-bold ${
                active
                  ? 'border-pink bg-pink text-white shadow-chunk-pink'
                  : done
                    ? 'border-mint bg-[#E8FBF3] text-mint-dark'
                    : 'border-purple-light bg-cream text-navy'
              }`}
            >
              {done && !active ? '✓' : w.week}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
