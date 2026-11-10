// Synthesized sound effects — no audio files, CSP-safe.
// Every sound is built from Web Audio oscillators + envelope.

import { useAppStore } from './store';

let ac: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ac) {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ac = new AC();
    } catch { return null; }
  }
  return ac;
}

function tone(freq: number, dur = 0.15, type: OscillatorType = 'sine', vol = 0.15, slide = 0, delay = 0): void {
  if (!useAppStore.getState().soundEnabled) return;
  const c = ctx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.linearRampToValueAtTime(freq + slide, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}

const seq = (notes: [number, number][], type: OscillatorType = 'triangle', vol = 0.12) => {
  notes.forEach(([f, t], i) => tone(f, t, type, vol, 0, i * (t * 0.7)));
};

let lastHover = 0;
let lastTyp = 0;

export const Sfx = {
  boot:   () => seq([[392, 0.15], [523, 0.15], [659, 0.15], [784, 0.15], [1047, 0.2]]),
  click:  () => tone(880, 0.06, 'triangle', 0.08),
  hover:  () => {
    const now = Date.now();
    if (now - lastHover < 150) return;
    lastHover = now;
    tone(720, 0.035, 'sine', 0.035);
  },
  key:    () => tone(950 + Math.random() * 300, 0.015, 'square', 0.015),
  type:   () => {
    const now = Date.now();
    if (now - lastTyp < 25) return;
    lastTyp = now;
    tone(1100 + Math.random() * 500, 0.02, 'square', 0.025);
  },
  run:    () => { tone(440, 0.08, 'square', 0.1); tone(660, 0.08, 'square', 0.1, 0, 0.06); },
  success: () => seq([[523, 0.15], [659, 0.15], [784, 0.15], [1047, 0.25]]),
  error:  () => { tone(330, 0.15, 'triangle', 0.08); tone(220, 0.25, 'triangle', 0.08, 0, 0.1); },
  star:   () => tone(1200, 0.12, 'sine', 0.1, 600),
  box:    () => seq([[523, 0.09], [784, 0.09], [1047, 0.12]]),
  mission: () => seq([[392, 0.1], [523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.15], [1319, 0.25]], 'triangle', 0.14),
  puzzleRight: () => seq([[523, 0.08], [784, 0.08], [1319, 0.2]]),
  puzzleWrong: () => tone(300, 0.2, 'sine', 0.06, -100),
  whoosh: () => tone(300, 0.18, 'sine', 0.05, 400),
  blip:   () => tone(1400, 0.025, 'square', 0.02),
};
