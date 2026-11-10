'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Sfx } from '@/lib/sounds';
import Pixi from '@/components/Pixi';

const TILES = [
  { href: '/play', ico: '⚡', title: 'Free Play', blurb: 'Type any Python and see what happens.', bg: 'from-[#7FD1EC] to-sky' },
  { href: '/lessons', ico: '🗺️', title: 'Lessons', blurb: '8 weeks — pick any one!',         bg: 'from-[#FFB088] to-coral' },
  { href: '/missions', ico: '🏆', title: 'Missions', blurb: 'Earn stars for solving them!',     bg: 'from-[#B07CFF] to-purple' },
  { href: '/puzzles', ico: '🎯', title: 'Puzzles',   blurb: 'Guess what the code will say.',    bg: 'from-[#FFE066] to-sun' },
  { href: '/teacher', ico: '🎓', title: 'Teacher',   blurb: 'Parent & teacher mode.',           bg: 'from-[#7FE2C8] to-mint' },
];

export default function HomePage() {
  const name = useAppStore((s) => s.childName);
  const weeksDone = useAppStore((s) => s.weeksDone);
  const currentWeek = useAppStore((s) => s.currentWeek);

  return (
    <div className="pb-20">
      <div className="mb-4 flex items-center gap-3 rounded-3xl border-4 border-purple-light bg-white/80 p-4 shadow-chunk">
        <Pixi size={72} />
        <div>
          <div className="font-display text-2xl font-bold text-navy">
            {name ? `Hi ${name}!` : 'Hi there!'} What do you want to play?
          </div>
          <div className="font-display text-sm font-semibold text-purple-dark">
            {Object.keys(weeksDone).length} weeks finished · This week: Week {currentWeek}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            onClick={() => Sfx.click()}
            onMouseEnter={() => Sfx.hover()}
            className="chunk-btn rounded-3xl border-[3px] border-[#FFE1B8] bg-white p-5 text-left shadow-chunk"
          >
            <span className={`mb-3 inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${t.bg} text-3xl text-white shadow-md`}>
              {t.ico}
            </span>
            <h3 className="font-display text-xl font-bold text-navy">{t.title}</h3>
            <p className="mt-1 font-display text-sm font-semibold text-purple-dark">{t.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
