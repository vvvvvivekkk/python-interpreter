'use client';

/**
 * Lightweight kid-friendly editor.
 * We intentionally use a <textarea> rather than Monaco for v1:
 *   - Monaco adds ~10 MB of workers & loader JS that complicates PWA/offline
 *   - A 5-year-old benefits more from a BIG font + chunky Run button than IntelliSense
 *   - The surrounding card gives it the look-and-feel of a Monaco panel
 * Upgrade path: drop in @monaco-editor/react later without touching callers.
 */

import { useEffect, useRef } from 'react';
import { Sfx } from '@/lib/sounds';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  showLineNumbers?: boolean;
  fontSize?: number;
  hint?: string;
  onHint?: () => void;
  onClear?: () => void;
}

export default function CodeEditor({
  value, onChange, onRun,
  showLineNumbers = false, fontSize = 22,
  hint, onHint, onClear,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Keep line-count column in sync
  const lines = value.split('\n').length;

  // Ctrl+Enter / Cmd+Enter to run
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); onRun(); }
    };
    el.addEventListener('keydown', h);
    return () => el.removeEventListener('keydown', h);
  }, [onRun]);

  return (
    <div className="rounded-3xl bg-navy p-3 shadow-chunk" style={{ background: '#241548' }}>
      {/* Mac-style dots */}
      <div className="mb-2 flex gap-1.5 px-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B6B]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FFD93D]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#6BCB77]" />
      </div>
      <div className="flex">
        {showLineNumbers && (
          <div
            aria-hidden="true"
            className="select-none pr-2 text-right font-code text-[#8B7FB8]"
            style={{ fontSize }}
          >
            {Array.from({ length: Math.max(lines, 1) }, (_, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{i + 1}</div>
            ))}
          </div>
        )}
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => { onChange(e.target.value); Sfx.key(); }}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="w-full flex-1 resize-y bg-transparent font-code font-medium text-[#FFEEC2] outline-none placeholder:text-[#8B7FB8]/50"
          style={{ fontSize, lineHeight: 1.6, caretColor: '#FFD93D', minHeight: 180 }}
          aria-label="Python code editor"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 px-2">
        <button
          onClick={() => { Sfx.run(); onRun(); }}
          className="chunk-btn rounded-full bg-gradient-to-b from-[#46DD8F] to-mint px-6 py-3 font-display text-lg font-bold text-white shadow-chunk-mint"
        >
          ▶ Run Code
        </button>
        {onHint ? (
          <button
            onClick={() => { Sfx.click(); onHint(); }}
            className="chunk-btn rounded-full border-2 border-[#FFE1B8] bg-cream px-5 py-3 font-display font-bold"
          >
            💡 Hint
          </button>
        ) : null}
        {onClear ? (
          <button
            onClick={() => { Sfx.click(); onClear(); }}
            className="chunk-btn rounded-full border-2 border-[#FFE1B8] bg-cream px-5 py-3 font-display font-bold"
          >
            🧽 Clear
          </button>
        ) : null}
        {hint ? (
          <span className="ml-auto self-center font-display text-sm text-cream">💬 {hint}</span>
        ) : null}
      </div>
    </div>
  );
}
