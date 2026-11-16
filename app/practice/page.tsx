'use client';

import Link from 'next/link';
import lessonsData from '@/content/lessons.json';
import Pixi from '@/components/Pixi';
import { Sfx } from '@/lib/sounds';

interface Lesson { week: number; title: string; concept: string }

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

export default function PracticeHubPage() {
  const lessons = lessonsData as Lesson[];

  return (
    <div className="space-y-5 pb-20">
      <div className="rounded-3xl border-4 border-pink bg-white/90 p-5 shadow-chunk">
        <div className="flex items-start gap-3">
          <Pixi size={72} />
          <div>
            <h1 className="font-display text-3xl font-bold text-pink-dark">🎯 Practice Hub</h1>
            <p className="mt-1 font-display text-base font-semibold text-purple-dark">
              Tap any card to play practice games for that topic — no lesson scrolling needed.
            </p>
          </div>
        </div>
      </div>

      {/* Featured: Data Types workout (dad asked for this!) */}
      <Link
        href="/practice/data-types"
        onClick={() => Sfx.click()}
        onMouseEnter={() => Sfx.hover()}
        className="chunk-btn block rounded-3xl border-[4px] border-pink bg-gradient-to-br from-[#FFF0F6] via-[#F4ECFF] to-[#FFF8E7] p-5 shadow-chunk-pink"
      >
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink to-purple text-3xl text-white shadow-md">
            ⭐
          </div>
          <div className="flex-1">
            <div className="font-display text-xs font-bold uppercase tracking-wider text-pink-dark">
              Featured workout · extra practice
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-navy">
              Data Types — int, float & string
            </h2>
            <p className="mt-1 font-display font-semibold text-purple-dark">
              Sort values into type houses, hunt for quotes and decimal points, and learn why{' '}
              <span className="font-code">5</span>, <span className="font-code">&quot;5&quot;</span>{' '}
              and <span className="font-code">5.0</span> are all different.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['🏠 Sort game', '🔍 Spot the clue', '🔢 Number line', '🔄 Convert'].map((t) => (
                <span key={t} className="rounded-full border-2 border-pink bg-white px-3 py-1 font-display text-xs font-bold text-pink-dark">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="self-center font-display text-2xl font-bold text-pink">→</div>
        </div>
      </Link>

      {/* Featured: Periodic Table — connects chemistry + Python */}
      <Link
        href="/practice/periodic-table"
        onClick={() => Sfx.click()}
        onMouseEnter={() => Sfx.hover()}
        className="chunk-btn block rounded-3xl border-[4px] border-sky bg-gradient-to-br from-[#E3F6FF] via-[#F4ECFF] to-[#E8FBF3] p-5 shadow-chunk"
      >
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky to-mint text-3xl text-white shadow-md">
            🧪
          </div>
          <div className="flex-1">
            <div className="font-display text-xs font-bold uppercase tracking-wider text-sky-dark" style={{ color: '#0E86AF' }}>
              New · science meets code
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-navy">
              Python meets the Periodic Table
            </h2>
            <p className="mt-1 font-display font-semibold text-purple-dark">
              Every element is 4 Python variables — an int, a float, and two strings. Tap any
              element and see its real Python code. Covers first 18 + famous friends like gold!
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['⚛️ 18+ elements', '🔢 Pick the type', '📋 Element lists', '✨ Fun facts'].map((t) => (
                <span key={t} className="rounded-full border-2 border-sky bg-white px-3 py-1 font-display text-xs font-bold text-sky-dark" style={{ color: '#0E86AF' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="self-center font-display text-2xl font-bold text-sky">→</div>
        </div>
      </Link>

      {/* By-week practice cards */}
      <div>
        <h2 className="mt-4 mb-2 font-display text-xl font-bold text-navy">📚 By week</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((l, i) => (
            <Link
              key={l.week}
              href={`/lesson/${l.week}#practice`}
              onClick={() => Sfx.click()}
              onMouseEnter={() => Sfx.hover()}
              className="chunk-btn relative rounded-3xl border-[3px] border-[#FFE1B8] bg-white p-4 shadow-chunk"
            >
              <div className={`inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow-md ${GRADIENTS[i % GRADIENTS.length]}`}>
                {ICONS[i % ICONS.length]}
              </div>
              <div className="mt-2 font-display text-xs font-bold uppercase tracking-wider text-purple-dark">
                Week {l.week} practice
              </div>
              <h3 className="font-display text-lg font-bold text-navy">{l.title}</h3>
              <div className="mt-1 font-code text-xs text-pink-dark">{l.concept}</div>
              <div className="mt-2 flex flex-wrap gap-1 text-xs font-semibold text-purple-dark">
                <span>fill-blanks</span>
                <span>·</span>
                <span>match</span>
                <span>·</span>
                <span>boxes</span>
                <span>·</span>
                <span>draw</span>
                <span>·</span>
                <span>challenge</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
