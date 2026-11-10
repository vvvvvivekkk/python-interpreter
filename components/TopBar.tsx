'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Sfx } from '@/lib/sounds';
import { Home, Volume2, VolumeX } from 'lucide-react';

export default function TopBar() {
  const name = useAppStore((s) => s.childName);
  const stars = useAppStore((s) => s.stars);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const toggleSound = useAppStore((s) => s.toggleSound);

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b-4 border-purple-light bg-white/90 px-4 py-2 backdrop-blur">
      <Link
        href="/home"
        onClick={() => Sfx.click()}
        className="flex items-center gap-2 font-display text-lg font-bold text-pink"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-pink to-purple text-xl text-white shadow-chunk-pink">
          🐍
        </span>
        Python Fun World
      </Link>
      <div className="flex-1" />
      {name ? (
        <span className="rounded-full border-2 border-purple-light bg-purple-light/30 px-3 py-1 font-display text-sm font-bold text-purple-dark">
          👋 {name}
        </span>
      ) : null}
      <span
        className="flex items-center gap-1 rounded-full border-2 border-sun bg-cream px-3 py-1 font-display text-sm font-bold"
        title="Stars earned"
      >
        <span>⭐</span>
        <span>{stars}</span>
      </span>
      <Link
        href="/home"
        onClick={() => Sfx.click()}
        className="grid h-10 w-10 place-items-center rounded-full border-2 border-purple-light bg-cream"
        aria-label="Go home"
      >
        <Home size={18} />
      </Link>
      <button
        onClick={() => { toggleSound(); Sfx.click(); }}
        className="grid h-10 w-10 place-items-center rounded-full border-2 border-purple-light bg-cream"
        aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
      >
        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </header>
  );
}
