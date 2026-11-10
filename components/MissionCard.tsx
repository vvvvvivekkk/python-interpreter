'use client';

import { Sfx } from '@/lib/sounds';

export interface MissionInfo {
  id: string;
  title: string;
  icon: string;
  brief: string;
  hint: string;
  starter: string;
}

interface Props {
  mission: MissionInfo;
  earned: number; // 0..3
  onOpen: () => void;
}

export default function MissionCard({ mission, earned, onOpen }: Props) {
  const done = earned > 0;
  return (
    <button
      onClick={() => { Sfx.click(); onOpen(); }}
      onMouseEnter={() => Sfx.hover()}
      className={`chunk-btn text-left rounded-3xl border-[3px] p-5 shadow-chunk ${
        done ? 'border-mint bg-[#E8FBF3]' : 'border-[#FFE1B8] bg-white'
      }`}
    >
      <div className="font-display text-xs font-bold uppercase tracking-wider text-pink">
        Mission
      </div>
      <div className="mt-1 flex items-start gap-2">
        <span className="text-3xl leading-none">{mission.icon}</span>
        <div className="flex-1">
          <h4 className="font-display text-lg font-bold text-navy">{mission.title}</h4>
          <p className="mt-1 text-sm font-semibold text-purple-dark">{mission.brief}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`text-lg ${n <= earned ? '' : 'opacity-25'}`}>⭐</span>
        ))}
      </div>
    </button>
  );
}
