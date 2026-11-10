// Pixi's voice — wraps window.speechSynthesis.
// Picks a friendly female English voice when available.
// Queue system: cancel previous before speaking new.

import { useAppStore } from './store';

let voices: SpeechSynthesisVoice[] = [];
let voicesReady = false;

function loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    voices = window.speechSynthesis.getVoices();
    if (voices.length) voicesReady = true;
  } catch { /* ignore */ }
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (!voicesReady) loadVoices();
  const preferred = [
    'Samantha', 'Karen', 'Google US English',
    'Microsoft Zira', 'Victoria', 'Google UK English Female',
  ];
  for (const name of preferred) {
    const v = voices.find((x) => x.name && x.name.indexOf(name) !== -1);
    if (v) return v;
  }
  const fem = voices.find((v) => /female/i.test(v.name) && /^en/i.test(v.lang));
  if (fem) return fem;
  const en = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  return en || voices[0] || null;
}

export interface SpeakOpts {
  onDone?: () => void;
  onStart?: () => void;
}

export function speak(text: string, opts: SpeakOpts = {}): void {
  if (!useAppStore.getState().voiceEnabled) {
    if (opts.onDone) setTimeout(opts.onDone, 300);
    return;
  }
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (opts.onDone) setTimeout(opts.onDone, 300);
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.3;
    u.volume = 0.9;
    const v = pickVoice();
    if (v) u.voice = v;
    if (opts.onStart) u.onstart = opts.onStart;
    if (opts.onDone) u.onend = opts.onDone;
    window.speechSynthesis.speak(u);
  } catch {
    if (opts.onDone) setTimeout(opts.onDone, 300);
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  }
}
