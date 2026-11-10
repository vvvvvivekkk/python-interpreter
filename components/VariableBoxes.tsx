'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Sfx } from '@/lib/sounds';
import type { PyValue } from '@/lib/python';

interface Props {
  vars: Record<string, PyValue>;
}

function isFunc(v: PyValue): boolean {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && (v as { type?: string }).type === '__pyfunc__';
}

export default function VariableBoxes({ vars }: Props) {
  const prevKeys = useRef<string>('');
  useEffect(() => {
    const keys = Object.keys(vars).sort().join(',');
    if (keys && keys !== prevKeys.current) Sfx.box();
    prevKeys.current = keys;
  }, [vars]);

  const entries = Object.entries(vars).filter(([, v]) => !isFunc(v));
  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border-4 border-dashed border-purple-light bg-white/60 p-6 text-center font-display font-semibold italic text-purple/60">
        No boxes yet — make one! 📦
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-4 rounded-3xl border-4 border-purple-light bg-white/70 p-5 shadow-chunk">
      <AnimatePresence>
        {entries.map(([name, value]) => {
          const isNum = typeof value === 'number';
          const isStr = typeof value === 'string';
          const display = isStr ? `"${value}"` : isNum ? String(value) : Array.isArray(value) ? JSON.stringify(value) : String(value);
          const ribbon = isNum ? '🔢' : isStr ? '💬' : '📦';
          return (
            <motion.div
              key={name}
              layout
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className={`relative overflow-hidden rounded-3xl p-4 text-center font-display ${
                isNum
                  ? 'bg-gradient-to-br from-pink-light to-pink border-pink-dark border-[3px]'
                  : 'bg-gradient-to-br from-sun to-[#FFC760] border-[#E5A530] border-[3px]'
              }`}
              style={{ boxShadow: isNum ? '0 6px 0 #C13D73' : '0 6px 0 #D89520' }}
            >
              <span className="absolute left-1/2 top-[-12px] -translate-x-1/2 whitespace-nowrap rounded-full bg-purple px-3 py-1 text-xs font-bold text-white shadow-md">
                {name}
              </span>
              <span className="mt-1 block text-2xl">{ribbon}</span>
              <span className="mt-1 block break-words font-code text-lg font-bold text-navy">
                {display}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
