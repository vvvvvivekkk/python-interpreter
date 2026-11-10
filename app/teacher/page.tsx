'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import StickerWall from '@/components/StickerWall';
import WorksheetsTab from '@/components/WorksheetsTab';
import { Sfx } from '@/lib/sounds';

const WEEK_NOTES: Record<number, string[]> = {
  1: [
    '1 min — Warm-up: "What did you code last week?"',
    '5 min — Talk Shop: print("Hello!"), change messages',
    '5 min — Try print with 2 words: print("Hi", "Ava")',
    '4 min — Guess the Output (2–3 puzzles)',
    '4 min — Mission: Say your own name',
    '1 min — Celebrate stars',
  ],
  2: [
    '1 min — "Boxes" metaphor: "like a box with a name"',
    '5 min — name = "Ava" + print(name)',
    '5 min — age = 5 (no quotes!), then hero + power',
    '4 min — Planned error: name = Ava (no quotes) → good teaching',
    '4 min — Mission: Make hero AND power boxes',
    '1 min — Preview Week 3: joining words',
  ],
  3: ['Teach: + glues words; comma makes a space; try a birthday-card message'],
  4: ['Teach: if / else with score. Live-change score, re-run, see choice flip'],
  5: ['Teach: for star in range(5). Unicorn parade. Countdown.'],
  6: ['Teach: lists = [items]; a[0] first spot; combine with for loop'],
  7: ['Teach: input() asks YOU. Greet by name. Note: works via modal, not window.prompt'],
  8: ['Teach: def name(): give the computer a new word. Call twice.'],
};

export default function TeacherPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPin, setNewPin] = useState('');

  const teacherPin = useAppStore((s) => s.teacherPin);
  const setTeacherPin = useAppStore((s) => s.setPin);
  const childName = useAppStore((s) => s.childName);
  const setChildName = useAppStore((s) => s.setName);
  const resetAll = useAppStore((s) => s.reset);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const voiceEnabled = useAppStore((s) => s.voiceEnabled);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const toggleVoice = useAppStore((s) => s.toggleVoice);

  const tryUnlock = () => {
    if (pin === teacherPin) { setUnlocked(true); Sfx.success(); }
    else Sfx.error();
  };

  const exportProgress = () => {
    const data = JSON.stringify(useAppStore.getState(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `python-fun-world-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!unlocked) {
    return (
      <div className="pb-20">
        <div className="mx-auto max-w-sm rounded-3xl border-4 border-purple bg-white p-6 shadow-chunk">
          <h1 className="font-display text-2xl font-bold text-navy">🎓 Teacher Mode</h1>
          <p className="mt-1 text-sm font-semibold text-purple-dark">Enter the 4-digit PIN (default 1234).</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') tryUnlock(); }}
            maxLength={8}
            className="mt-4 w-full rounded-2xl border-4 border-purple-light bg-cream px-4 py-3 text-center font-code text-2xl font-bold outline-none focus:border-pink"
            inputMode="numeric"
            autoFocus
          />
          <button
            onClick={tryUnlock}
            className="chunk-btn mt-4 w-full rounded-full bg-pink py-3 font-display text-lg font-bold text-white shadow-chunk-pink"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="rounded-3xl border-4 border-purple bg-white p-5 shadow-chunk">
        <h1 className="font-display text-2xl font-bold text-navy">🎓 Teacher Mode</h1>
        <p className="mt-1 text-sm font-semibold text-purple-dark">Welcome back! Everything the lesson needs is below.</p>
      </div>

      <section className="rounded-3xl border-4 border-purple-light bg-white p-5 shadow-chunk">
        <h2 className="font-display text-xl font-bold">📅 Session plan (20-minute cheat-sheet)</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(WEEK_NOTES).map(([w, notes]) => (
            <div key={w} className="rounded-2xl border-2 border-purple-light bg-cream p-3">
              <div className="font-display text-sm font-bold text-pink">Week {w}</div>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm font-semibold text-navy">
                {notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border-4 border-purple-light bg-white p-5 shadow-chunk">
        <h2 className="font-display text-xl font-bold">⚙️ Settings</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-2xl border-2 border-purple-light bg-cream p-3 font-display font-semibold">
            Sound effects
            <input type="checkbox" checked={soundEnabled} onChange={() => toggleSound()} />
          </label>
          <label className="flex items-center justify-between rounded-2xl border-2 border-purple-light bg-cream p-3 font-display font-semibold">
            Pixi voice
            <input type="checkbox" checked={voiceEnabled} onChange={() => toggleVoice()} />
          </label>
          <label className="rounded-2xl border-2 border-purple-light bg-cream p-3 font-display font-semibold">
            Child&apos;s name
            <input
              className="mt-1 w-full rounded-full border-2 border-purple-light bg-white px-3 py-2 font-display"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
            />
          </label>
          <div className="rounded-2xl border-2 border-purple-light bg-cream p-3 font-display font-semibold">
            Change PIN
            {showChangePin ? (
              <div className="mt-1 flex gap-2">
                <input
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="flex-1 rounded-full border-2 border-purple-light bg-white px-3 py-2 font-code"
                  placeholder="New PIN"
                />
                <button
                  onClick={() => { setTeacherPin(newPin || '1234'); setShowChangePin(false); setNewPin(''); Sfx.success(); }}
                  className="rounded-full bg-mint px-3 py-2 text-sm font-bold text-white"
                >
                  Save
                </button>
              </div>
            ) : (
              <button onClick={() => setShowChangePin(true)} className="mt-1 w-full rounded-full border-2 border-purple-light bg-white px-3 py-2">
                Change
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={exportProgress} className="chunk-btn rounded-full bg-sky px-4 py-2 font-display font-bold text-white">
            ⬇️ Export progress
          </button>
          <button
            onClick={() => { if (confirm('Really reset everything? This clears name, stars, and progress.')) { resetAll(); Sfx.error(); } }}
            className="chunk-btn rounded-full border-2 border-coral bg-cream px-4 py-2 font-display font-bold text-coral"
          >
            🗑 Reset progress
          </button>
        </div>
      </section>

      <WorksheetsTab />

      <section className="rounded-3xl border-4 border-purple-light bg-white p-5 shadow-chunk">
        <h2 className="font-display text-xl font-bold">🏅 Sticker book</h2>
        <div className="mt-3"><StickerWall /></div>
      </section>
    </div>
  );
}
