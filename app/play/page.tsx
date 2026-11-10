'use client';

import { useState } from 'react';
import { runPython, PyValue } from '@/lib/python';
import CodeEditor from '@/components/CodeEditor';
import Terminal from '@/components/Terminal';
import VariableBoxes from '@/components/VariableBoxes';
import ChipButton from '@/components/ChipButton';
import InputModal from '@/components/InputModal';
import Pixi from '@/components/Pixi';
import { useAppStore } from '@/lib/store';
import { Sfx } from '@/lib/sounds';

const CHIPS: { label: string; code: string }[] = [
  { label: '👋 Hello',      code: 'print("Hello!")' },
  { label: '🐱 Cats',       code: 'print("I love cats!")' },
  { label: '📦 Name box',   code: 'name = "Ava"\nprint("Hi,", name)' },
  { label: '🧮 Math',       code: 'print(2 + 3)' },
  { label: '🔁 Loop x3',    code: 'for i in range(3):\n    print("yay")' },
  { label: '🦄 List',       code: 'pets = ["cat", "dog", "unicorn"]\nprint(pets[0])' },
];

export default function PlayPage() {
  const saved = useAppStore((s) => s.savedCode['play'] ?? 'print("Hello!")');
  const saveCode = useAppStore((s) => s.saveCode);
  const [code, setCode] = useState<string>(saved);
  const [output, setOutput] = useState<string>('');
  const [vars, setVars] = useState<Record<string, PyValue>>({});
  const [err, setErr] = useState<{ friendly: string; emoji: string } | null>(null);
  const [inputPrompt, setInputPrompt] = useState<string | null>(null);
  const [pendingInputs, setPendingInputs] = useState<string[]>([]);

  const run = (extraInputs: string[] = []) => {
    const inputs = [...pendingInputs, ...extraInputs];
    const r = runPython(code, { inputs });
    setOutput(r.output);
    setVars(r.vars);
    if (r.needsInput) {
      setInputPrompt(r.needsInput.prompt);
      setErr(null);
      return;
    }
    setPendingInputs([]);
    setErr(r.error ? { friendly: r.error.friendly, emoji: r.error.emoji } : null);
    if (r.ok) Sfx.success(); else Sfx.error();
  };

  const onInputSubmit = (v: string) => {
    setInputPrompt(null);
    setPendingInputs((prev) => {
      const next = [...prev, v];
      // Re-run with the new input queued
      const r = runPython(code, { inputs: next });
      setOutput(r.output);
      setVars(r.vars);
      if (r.needsInput) {
        setInputPrompt(r.needsInput.prompt);
        return next;
      }
      setErr(r.error ? { friendly: r.error.friendly, emoji: r.error.emoji } : null);
      if (r.ok) Sfx.success(); else Sfx.error();
      return [];
    });
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border-4 border-purple-light bg-white/90 p-4 shadow-chunk">
        <Pixi size={64} />
        <h1 className="font-display text-2xl font-bold text-navy">Free Play</h1>
        <div className="ml-auto flex flex-wrap gap-2">
          {CHIPS.map((c) => (
            <ChipButton key={c.label} label={c.label} onClick={() => setCode((p) => (p.trim() ? p.trim() + '\n' + c.code : c.code))} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CodeEditor
          value={code}
          onChange={(v) => { setCode(v); saveCode('play', v); }}
          onRun={() => run()}
          onClear={() => { setCode('print("Hello!")'); setOutput(''); setVars({}); setErr(null); }}
        />
        <div className="space-y-4">
          <VariableBoxes vars={vars} />
          <Terminal output={output} error={err} onClear={() => { setOutput(''); setErr(null); }} />
        </div>
      </div>
      <InputModal
        open={inputPrompt !== null}
        prompt={inputPrompt ?? ''}
        onSubmit={onInputSubmit}
      />
    </div>
  );
}
