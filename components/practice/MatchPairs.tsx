'use client';

/**
 * MatchPairs — drag-to-draw-line matching (iPad touch-friendly).
 * Press on a left card, drag toward the right card it matches, release.
 * Correct: line snaps mint-green and locks in. Wrong: line flashes red
 * and disappears. All matched = confetti + star.
 *
 * Same API as before so callers (PracticeSection etc.) don't change.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sfx } from '@/lib/sounds';
import { burst } from '@/components/ConfettiBurst';
import { useAppStore } from '@/lib/store';
import { speak } from '@/lib/speak';

export interface Pair { code: string; output: string }
interface Props { pairs: Pair[] }

type Anchor = { x: number; y: number };

export default function MatchPairs({ pairs }: Props) {
  // Shuffle right-column display order; keep original index mapping
  const shuffled = useMemo(() => {
    const order = pairs.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }, [pairs]);

  // matched: leftIdx -> right-column display position
  const [matched, setMatched] = useState<Map<number, number>>(new Map());
  const [draggingLeft, setDraggingLeft] = useState<number | null>(null);
  const [pointer, setPointer] = useState<Anchor>({ x: 0, y: 0 });
  const [hoverRightPos, setHoverRightPos] = useState<number | null>(null);
  const [wrongFlash, setWrongFlash] = useState<{ left: number; right: number } | null>(null);
  const [tick, setTick] = useState(0); // force re-render when card positions change

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const addStars = useAppStore((s) => s.addStars);

  const allDone = matched.size === pairs.length;

  const toContainer = (clientX: number, clientY: number): Anchor => {
    const r = containerRef.current!.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const cardAnchor = (el: HTMLDivElement | null, side: 'right' | 'left'): Anchor => {
    if (!el || !containerRef.current) return { x: 0, y: 0 };
    const c = containerRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: (side === 'right' ? r.right : r.left) - c.left,
      y: r.top + r.height / 2 - c.top,
    };
  };

  const startDrag = (leftIdx: number) => (e: React.PointerEvent) => {
    if (matched.has(leftIdx)) return;
    e.preventDefault();
    try { (e.target as Element & { setPointerCapture?: (id: number) => void }).setPointerCapture?.(e.pointerId); } catch {}
    Sfx.click();
    setDraggingLeft(leftIdx);
    setPointer(toContainer(e.clientX, e.clientY));
  };

  // Global pointer tracking while dragging
  useEffect(() => {
    if (draggingLeft === null) return;
    const move = (e: PointerEvent) => {
      setPointer(toContainer(e.clientX, e.clientY));
      // detect hovered right card
      const idx = rightRefs.current.findIndex((r) => {
        if (!r) return false;
        const rect = r.getBoundingClientRect();
        return (
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom
        );
      });
      setHoverRightPos(idx === -1 ? null : idx);
    };
    const up = (e: PointerEvent) => {
      const idx = rightRefs.current.findIndex((r) => {
        if (!r) return false;
        const rect = r.getBoundingClientRect();
        return (
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom
        );
      });
      if (idx !== -1) handleDrop(draggingLeft, idx);
      setDraggingLeft(null);
      setHoverRightPos(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [draggingLeft]);

  // Re-render matched lines on scroll/resize
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener('resize', bump);
    window.addEventListener('scroll', bump, true);
    return () => {
      window.removeEventListener('resize', bump);
      window.removeEventListener('scroll', bump, true);
    };
  }, []);

  const handleDrop = (leftIdx: number, rightPos: number) => {
    const realIdx = shuffled[rightPos];
    if (realIdx === leftIdx) {
      // Match!
      Sfx.success();
      const next = new Map(matched);
      next.set(leftIdx, rightPos);
      setMatched(next);
      if (next.size === pairs.length) {
        setTimeout(() => {
          burst({ count: 50 });
          addStars(1);
          speak('All matched! Super!');
        }, 200);
      }
    } else {
      Sfx.puzzleWrong();
      setWrongFlash({ left: leftIdx, right: rightPos });
      setTimeout(() => setWrongFlash(null), 600);
    }
  };

  // Line endpoints (recomputed each render — uses live DOM rects)
  void tick;
  const matchedLines = Array.from(matched.entries()).map(([leftIdx, rightPos]) => ({
    key: leftIdx,
    from: cardAnchor(leftRefs.current[leftIdx], 'right'),
    to: cardAnchor(rightRefs.current[rightPos], 'left'),
  }));
  const dragFrom = draggingLeft !== null ? cardAnchor(leftRefs.current[draggingLeft], 'right') : null;

  return (
    <div className="rounded-3xl border-4 border-sky bg-white p-5 shadow-chunk">
      <h3 className="font-display text-xl font-bold text-pink-dark">2. Match the output</h3>
      <p className="mt-1 text-sm font-semibold text-purple-dark">
        <b>Press and hold</b> a code card, then <b>drag a line</b> to the output it makes!
      </p>

      <div ref={containerRef} className="relative mt-4" style={{ touchAction: 'none' }}>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 sm:gap-x-16">
          {/* Left column — codes */}
          <div className="space-y-2">
            <div className="font-display text-xs font-bold uppercase text-purple-dark">Code</div>
            {pairs.map((p, i) => {
              const done = matched.has(i);
              const isDragging = draggingLeft === i;
              const isWrong = wrongFlash?.left === i;
              return (
                <motion.div
                  key={i}
                  ref={(el) => { leftRefs.current[i] = el; }}
                  onPointerDown={startDrag(i)}
                  animate={isWrong ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`select-none rounded-2xl border-2 p-3 text-left font-code text-sm whitespace-pre-wrap ${
                    done
                      ? 'cursor-default border-mint bg-mint/20 text-mint-dark opacity-70'
                      : isDragging
                        ? 'cursor-grabbing border-pink bg-pink-light/40 shadow-chunk-pink'
                        : 'cursor-grab border-purple-light bg-cream hover:border-pink'
                  }`}
                  style={{ WebkitUserSelect: 'none' }}
                >
                  {p.code}
                </motion.div>
              );
            })}
          </div>
          {/* Right column — outputs */}
          <div className="space-y-2">
            <div className="font-display text-xs font-bold uppercase text-purple-dark">Output</div>
            {shuffled.map((realIdx, pos) => {
              const done = Array.from(matched.values()).includes(pos);
              const isHover = hoverRightPos === pos && draggingLeft !== null;
              const isWrong = wrongFlash?.right === pos;
              return (
                <motion.div
                  key={pos}
                  ref={(el) => { rightRefs.current[pos] = el; }}
                  animate={isWrong ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`select-none rounded-2xl border-2 p-3 text-left font-code text-sm whitespace-pre-wrap transition ${
                    done
                      ? 'border-mint bg-mint/20 text-mint-dark opacity-70'
                      : isHover
                        ? 'border-pink bg-sun/30 scale-105 shadow-chunk'
                        : 'border-purple-light/50 bg-cream/60'
                  }`}
                >
                  {pairs[realIdx].output}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SVG overlay for lines */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ overflow: 'visible' }}
        >
          {/* Permanent matched lines (mint) */}
          {matchedLines.map((l) => (
            <g key={l.key}>
              <line
                x1={l.from.x} y1={l.from.y} x2={l.to.x} y2={l.to.y}
                stroke="#06D6A0" strokeWidth="4" strokeLinecap="round"
              />
              <circle cx={l.from.x} cy={l.from.y} r="5" fill="#06D6A0" />
              <circle cx={l.to.x} cy={l.to.y} r="5" fill="#06D6A0" />
            </g>
          ))}
          {/* Live drag line (pink dashed) */}
          {dragFrom && (
            <g>
              <line
                x1={dragFrom.x} y1={dragFrom.y} x2={pointer.x} y2={pointer.y}
                stroke="#FF6B9D" strokeWidth="3" strokeLinecap="round"
                strokeDasharray="7,5"
              />
              <circle cx={dragFrom.x} cy={dragFrom.y} r="5" fill="#FF6B9D" />
              <circle cx={pointer.x} cy={pointer.y} r="7" fill="#FF6B9D" opacity="0.6" />
            </g>
          )}
        </svg>
      </div>

      {allDone ? (
        <div className="mt-4 rounded-2xl border-2 border-mint bg-mint/10 p-3 font-display text-base font-bold text-mint-dark">
          🎉 All matched! +1 ⭐
        </div>
      ) : (
        <div className="mt-3 text-xs font-semibold text-purple-dark">
          {matched.size} / {pairs.length} matched · hold and drag from a code card
        </div>
      )}
    </div>
  );
}
