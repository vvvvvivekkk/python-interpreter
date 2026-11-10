'use client';

import { useMemo, useState } from 'react';
import missionsData from '@/content/missions.json';
import MissionCard, { MissionInfo } from '@/components/MissionCard';
import CodeEditor from '@/components/CodeEditor';
import Terminal from '@/components/Terminal';
import VariableBoxes from '@/components/VariableBoxes';
import { runPython, PyValue } from '@/lib/python';
import { checkMission } from '@/lib/python/missions';
import { useAppStore } from '@/lib/store';
import { Sfx } from '@/lib/sounds';
import { burst, cannon } from '@/components/ConfettiBurst';
import { speak } from '@/lib/speak';

export default function MissionsPage() {
  const missions = missionsData as MissionInfo[];
  const [activeId, setActiveId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [tries, setTries] = useState(0);
  const [output, setOutput] = useState('');
  const [vars, setVars] = useState<Record<string, PyValue>>({});
  const [err, setErr] = useState<{ friendly: string; emoji: string } | null>(null);

  const missionsDone = useAppStore((s) => s.missionsDone);
  const finishMission = useAppStore((s) => s.finishMission);
  const name = useAppStore((s) => s.childName);
  const earnSticker = useAppStore((s) => s.earnSticker);

  const active = missions.find((m) => m.id === activeId) ?? null;

  const open = (m: MissionInfo) => {
    setActiveId(m.id);
    setCode(m.starter);
    setTries(0);
    setOutput('');
    setVars({});
    setErr(null);
  };

  const run = () => {
    if (!active) return;
    const r = runPython(code);
    setOutput(r.output); setVars(r.vars);
    setErr(r.error ? { friendly: r.error.friendly, emoji: r.error.emoji } : null);
    setTries((t) => t + 1);
    const ok = r.ok && checkMission(active.id, code, r, name);
    if (ok) {
      const stars = tries === 0 ? 3 : tries === 1 ? 2 : 1;
      finishMission(active.id, stars);
      earnSticker(`mission:${active.id}`);
      Sfx.mission();
      cannon();
      burst({ count: 60 });
      speak(`Super work! Mission complete!`);
    } else {
      if (r.ok) Sfx.puzzleWrong(); else Sfx.error();
    }
  };

  const earnedCount = useMemo(() => Object.keys(missionsDone).length, [missionsDone]);

  return (
    <div className="pb-20">
      <div className="mb-4 flex items-center justify-between rounded-3xl border-4 border-purple-light bg-white/90 p-4 shadow-chunk">
        <h1 className="font-display text-2xl font-bold text-navy">🏆 Missions</h1>
        <span className="font-display text-sm font-bold text-purple-dark">
          {earnedCount} / {missions.length} complete
        </span>
      </div>
      {!active ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {missions.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              earned={missionsDone[m.id] ?? 0}
              onOpen={() => open(m)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl border-4 border-pink bg-[#FFF0F6] p-5 shadow-chunk">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{active.icon}</span>
              <div className="flex-1">
                <div className="font-display text-xs font-bold uppercase text-pink">Mission</div>
                <h2 className="font-display text-2xl font-bold text-navy">{active.title}</h2>
                <p className="mt-1 font-display font-semibold text-purple-dark">{active.brief}</p>
              </div>
              <button
                onClick={() => { Sfx.click(); setActiveId(null); }}
                className="chunk-btn rounded-full border-2 border-purple-light bg-white px-4 py-2 font-display font-bold"
              >
                ⬅ All missions
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CodeEditor
              value={code}
              onChange={setCode}
              onRun={run}
              onHint={() => { speak(active.hint); setErr({ friendly: active.hint, emoji: '💡' }); }}
            />
            <div className="space-y-4">
              <VariableBoxes vars={vars} />
              <Terminal output={output} error={err} onClear={() => { setOutput(''); setErr(null); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
