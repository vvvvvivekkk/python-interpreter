'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import lessonsData from '@/content/lessons.json';
import LessonPane, { Lesson } from '@/components/LessonPane';
import CodeEditor from '@/components/CodeEditor';
import Terminal from '@/components/Terminal';
import VariableBoxes from '@/components/VariableBoxes';
import InputModal from '@/components/InputModal';
import ChipButton from '@/components/ChipButton';
import { runPython, PyValue } from '@/lib/python';
import { useAppStore } from '@/lib/store';
import { Sfx } from '@/lib/sounds';
import { cannon } from '@/components/ConfettiBurst';
import { speak } from '@/lib/speak';

export default function LessonPage() {
  const params = useParams<{ week: string }>();
  const router = useRouter();
  const week = Math.max(1, Math.min(8, parseInt(params.week, 10) || 1));
  const lesson = (lessonsData as Lesson[]).find((l) => l.week === week)!;

  const [stepIdx, setStepIdx] = useState(0);
  const step = lesson.steps[stepIdx];
  const [code, setCode] = useState<string>(step?.pre ?? '');
  const [output, setOutput] = useState<string>('');
  const [vars, setVars] = useState<Record<string, PyValue>>({});
  const [err, setErr] = useState<{ friendly: string; emoji: string } | null>(null);
  const [inputPrompt, setInputPrompt] = useState<string | null>(null);
  const [pendingInputs, setPendingInputs] = useState<string[]>([]);

  const finishWeek = useAppStore((s) => s.finishWeek);
  const earnSticker = useAppStore((s) => s.earnSticker);

  useEffect(() => {
    if (step?.pre !== undefined) setCode(step.pre);
    setOutput(''); setErr(null); setVars({}); setPendingInputs([]);
  }, [stepIdx, step]);

  const run = () => {
    const r = runPython(code, { inputs: pendingInputs });
    setOutput(r.output); setVars(r.vars);
    if (r.needsInput) { setInputPrompt(r.needsInput.prompt); return; }
    setPendingInputs([]);
    setErr(r.error ? { friendly: r.error.friendly, emoji: r.error.emoji } : null);
    if (r.ok) Sfx.success(); else Sfx.error();
  };
  const onInputSubmit = (v: string) => {
    setInputPrompt(null);
    const next = [...pendingInputs, v];
    setPendingInputs(next);
    const r = runPython(code, { inputs: next });
    setOutput(r.output); setVars(r.vars);
    if (r.needsInput) setInputPrompt(r.needsInput.prompt);
    else { setErr(r.error ? { friendly: r.error.friendly, emoji: r.error.emoji } : null); if (r.ok) Sfx.success(); }
  };

  const next = () => {
    if (stepIdx < lesson.steps.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      Sfx.mission();
      cannon();
      finishWeek(week);
      earnSticker(`week:${week}`);
      speak(`Super! You finished Week ${week}!`);
      setTimeout(() => router.push('/home'), 1800);
    }
  };

  const chips = useMemo(() => step?.chips ?? [], [step]);

  return (
    <div className="space-y-4 pb-20">
      <LessonPane
        lesson={lesson}
        stepIdx={stepIdx}
        onNext={next}
        onBack={() => setStepIdx((i) => Math.max(0, i - 1))}
      />
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <ChipButton key={i} label={c.replace(/^print\(/, '').slice(0, 24)} onClick={() => setCode((p) => (p.trim() ? p.trim() + '\n' + c : c))} />
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CodeEditor value={code} onChange={setCode} onRun={run} showLineNumbers={week >= 3} />
        <div className="space-y-4">
          <VariableBoxes vars={vars} />
          <Terminal output={output} error={err} onClear={() => { setOutput(''); setErr(null); }} />
        </div>
      </div>
      <InputModal open={inputPrompt !== null} prompt={inputPrompt ?? ''} onSubmit={onInputSubmit} />
    </div>
  );
}
