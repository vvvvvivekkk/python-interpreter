// Zustand store with localStorage persistence.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AppState {
  childName: string;
  stars: number;
  xp: number;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  teacherPin: string;
  missionsDone: Record<string, number>; // missionId -> stars earned (1..3)
  weeksDone: Record<number, boolean>;
  currentWeek: number;
  stickers: Record<string, boolean>;
  savedCode: Record<string, string>;
  snapshots: { name: string; code: string; when: string }[];
  guessStreak: number;

  setName: (name: string) => void;
  addStars: (n: number) => void;
  addXP: (n: number) => void;
  toggleSound: () => void;
  toggleVoice: () => void;
  setPin: (pin: string) => void;
  finishMission: (id: string, stars: number) => void;
  finishWeek: (w: number) => void;
  earnSticker: (id: string) => void;
  saveCode: (key: string, code: string) => void;
  addSnapshot: (name: string, code: string) => void;
  bumpGuessStreak: (right: boolean) => void;
  reset: () => void;
}

const initial = {
  childName: '',
  stars: 0,
  xp: 0,
  soundEnabled: true,
  voiceEnabled: true,
  teacherPin: '1234',
  missionsDone: {},
  weeksDone: {},
  currentWeek: 1,
  stickers: {},
  savedCode: {},
  snapshots: [],
  guessStreak: 0,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initial,
      setName: (name) => set({ childName: name.trim().slice(0, 20) }),
      addStars: (n) => set((s) => ({ stars: s.stars + n })),
      addXP:    (n) => set((s) => ({ xp: s.xp + n })),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
      setPin: (pin) => set({ teacherPin: pin }),
      finishMission: (id, stars) =>
        set((s) => ({
          missionsDone: { ...s.missionsDone, [id]: Math.max(s.missionsDone[id] ?? 0, stars) },
          stars: s.stars + (s.missionsDone[id] ? 0 : stars),
          stickers: { ...s.stickers, [`mission:${id}`]: true },
        })),
      finishWeek: (w) =>
        set((s) => ({
          weeksDone: { ...s.weeksDone, [w]: true },
          currentWeek: Math.max(s.currentWeek, w + 1),
          stickers: { ...s.stickers, [`week:${w}`]: true },
        })),
      earnSticker: (id) => set((s) => ({ stickers: { ...s.stickers, [id]: true } })),
      saveCode: (key, code) => set((s) => ({ savedCode: { ...s.savedCode, [key]: code } })),
      addSnapshot: (name, code) =>
        set((s) => ({ snapshots: [...s.snapshots, { name, code, when: new Date().toISOString() }] })),
      bumpGuessStreak: (right) =>
        set((s) => ({ guessStreak: right ? s.guessStreak + 1 : 0 })),
      reset: () => set(initial),
    }),
    {
      name: 'python-fun-world',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
