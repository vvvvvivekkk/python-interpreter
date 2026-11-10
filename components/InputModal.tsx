'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sfx } from '@/lib/sounds';

interface Props {
  open: boolean;
  prompt: string;
  onSubmit: (value: string) => void;
}

export default function InputModal({ open, prompt, onSubmit }: Props) {
  const [v, setV] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setV(''); setTimeout(() => ref.current?.focus(), 50); } }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-navy/50 px-4"
          role="dialog" aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md rounded-4xl border-4 border-purple bg-white p-6 shadow-chunk"
          >
            <p className="mb-3 font-display text-2xl font-bold text-navy">
              🤖 {prompt || 'What do you say?'}
            </p>
            <input
              ref={ref}
              value={v}
              onChange={(e) => setV(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { Sfx.click(); onSubmit(v); }
              }}
              className="w-full rounded-2xl border-4 border-purple-light bg-cream px-4 py-3 font-display text-xl font-semibold outline-none focus:border-pink"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => { Sfx.click(); onSubmit(v); }}
                className="chunk-btn rounded-full bg-pink px-6 py-3 font-display font-bold text-white shadow-chunk-pink"
              >
                Send ➡
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
