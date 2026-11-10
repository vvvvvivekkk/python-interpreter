'use client';

import { useAppStore } from '@/lib/store';

const ALL = [
  { id: 'week:1', ico: '👋', label: 'Hello Hero' },
  { id: 'week:2', ico: '📦', label: 'Box Keeper' },
  { id: 'week:3', ico: '🧮', label: 'Math Wizard' },
  { id: 'week:4', ico: '🎨', label: 'Word Painter' },
  { id: 'week:5', ico: '🎁', label: 'Choice Maker' },
  { id: 'week:6', ico: '🔁', label: 'Loop Master' },
  { id: 'week:7', ico: '📜', label: 'List Chief' },
  { id: 'week:8', ico: '✨', label: 'Magic Coder' },
  { id: 'mission:say-hello', ico: '🤖', label: 'Say Hi' },
  { id: 'mission:say-name', ico: '🧒', label: 'Name Sayer' },
  { id: 'mission:hero-power-boxes', ico: '🦸', label: 'Hero Maker' },
  { id: 'mission:loop-print-3', ico: '🔄', label: 'Repeater' },
];

export default function StickerWall() {
  const stickers = useAppStore((s) => s.stickers);
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
      {ALL.map((s) => {
        const earned = !!stickers[s.id];
        return (
          <div
            key={s.id}
            className={`rounded-3xl border-[3px] p-3 text-center ${
              earned ? 'border-sun bg-gradient-to-br from-sun to-[#FFB800]' : 'border-purple-light/50 bg-white/40 opacity-50'
            }`}
            title={s.label}
          >
            <div className="text-3xl">{s.ico}</div>
            <div className="mt-1 font-display text-xs font-bold text-navy">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}
