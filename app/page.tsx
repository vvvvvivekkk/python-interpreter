'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { speak } from '@/lib/speak';
import { Sfx } from '@/lib/sounds';
import { burst, cannon } from '@/components/ConfettiBurst';
import Pixi, { PixiState } from '@/components/Pixi';

export default function WelcomePage() {
  const router = useRouter();
  const existingName = useAppStore((s) => s.childName);
  const setName = useAppStore((s) => s.setName);
  const [input, setInput] = useState('');
  const [pixiState, setPixiState] = useState<PixiState>('idle');
  const greeted = useRef(false);

  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    if (existingName) {
      setPixiState('talking');
      speak(`Welcome back, ${existingName}!`, { onDone: () => setPixiState('idle') });
    } else {
      setPixiState('talking');
      setTimeout(() => {
        speak("Hi! I'm Pixi! What's your name?", { onDone: () => setPixiState('idle') });
      }, 400);
    }
  }, [existingName]);

  const submit = () => {
    const name = input.trim();
    if (!name) {
      speak('I need your name first!');
      return;
    }
    setName(name);
    Sfx.success();
    burst({ count: 100 });
    cannon();
    setPixiState('celebrating');
    const greeting = `Very good, ${name}! Let's learn Python together!`;
    speak(greeting, {
      onDone: () => {
        setPixiState('idle');
        Sfx.whoosh();
        router.push('/home');
      },
    });
    // Fallback transition if speech is disabled or doesn't fire onend
    setTimeout(() => router.push('/home'), 2800);
  };

  const enterApp = () => {
    Sfx.boot();
    router.push('/home');
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-xl text-center">
        <motion.div
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 12 }}
          className="mb-4 inline-block"
        >
          <Pixi state={pixiState} size={160} />
        </motion.div>
        <h1 className="font-display text-4xl font-bold leading-tight text-navy sm:text-6xl">
          Welcome to{' '}
          <span className="bg-gradient-to-br from-pink via-purple to-sky bg-clip-text text-transparent">
            Python Fun World!
          </span>
        </h1>

        {existingName ? (
          <>
            <p className="mt-4 font-display text-xl font-semibold text-purple-dark">
              Welcome back, {existingName}! 🎉
            </p>
            <button
              onClick={enterApp}
              className="chunk-btn mt-8 rounded-full bg-gradient-to-b from-[#FF77A9] to-pink px-8 py-5 font-display text-2xl font-bold text-white shadow-chunk-pink"
            >
              🚀 Start Adventure
            </button>
          </>
        ) : (
          <>
            <p className="mt-4 font-display text-xl font-semibold text-purple-dark">
              Hi! I&apos;m Pixi! What&apos;s your name?
            </p>
            <div className="mt-6">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                maxLength={20}
                autoCapitalize="words"
                placeholder="Type your name"
                className="mx-auto block w-full max-w-sm rounded-full border-4 border-purple-light bg-white px-6 py-4 text-center font-display text-3xl font-bold outline-none focus:border-pink"
                style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}
                autoFocus
              />
              <button
                onClick={submit}
                className="chunk-btn mt-6 rounded-full bg-gradient-to-b from-[#FF77A9] to-pink px-8 py-5 font-display text-2xl font-bold text-white shadow-chunk-pink"
              >
                🚀 Let&apos;s Go!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
