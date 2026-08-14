"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Full-screen tap-through paging, shared by the wishlist and the wish.
 *
 * Scrolling is passive — the reader drags a finger and things drift past. Every
 * tap here is a beat they chose, which is the difference between watching and
 * taking part. It borrows the grammar of Stories deliberately: the audience
 * already knows where to tap without being told.
 *
 * Handles taps, swipes, keyboard, and the page-scroll lock. What each card
 * looks like is entirely up to the caller.
 */
export function Deck({
  count,
  index,
  onIndex,
  children,
  tone = "loud",
  onAdvanceSound,
}: {
  count: number;
  index: number;
  onIndex: (next: number) => void;
  children: ReactNode;
  /** `loud` shows segment bars; `quiet` shows a thin thread line instead. */
  tone?: "loud" | "quiet";
  onAdvanceSound?: (direction: 1 | -1) => void;
}) {
  const reduced = useReducedMotion();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [hintGone, setHintGone] = useState(false);

  const go = useCallback(
    (direction: 1 | -1) => {
      const next = index + direction;
      if (next < 0 || next >= count) return;
      setHintGone(true);
      onAdvanceSound?.(direction);
      // A short tick on Android. Silent no-op on iOS, which does not expose
      // the API, and on anything that has vibration switched off.
      try {
        navigator.vibrate?.(8);
      } catch {
        /* unsupported */
      }
      onIndex(next);
    },
    [index, count, onIndex, onAdvanceSound],
  );

  // The deck owns the viewport while it is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Horizontal swipes page; vertical ones are left alone so a link inside
    // a card can still be dragged towards.
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  return (
    <div
      className="fixed inset-0 z-40 overflow-hidden bg-[var(--ivory)]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Progress */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
        {tone === "loud" ? (
          <div className="flex gap-1.5">
            {Array.from({ length: count }, (_, i) => (
              <div
                key={i}
                className="h-[3px] flex-1 overflow-hidden rounded-full bg-[var(--ivory-shadow)]"
              >
                <motion.div
                  className="h-full rounded-full bg-[var(--gold)]"
                  initial={false}
                  animate={{ width: i < index ? "100%" : i === index ? "100%" : "0%" }}
                  transition={{ duration: i === index ? 0.5 : 0, ease: "easeOut" }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto h-px w-full max-w-md overflow-hidden bg-[var(--ivory-shadow)]">
            <motion.div
              className="h-full bg-[var(--gold)]"
              initial={false}
              animate={{ width: `${((index + 1) / count) * 100}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        )}
      </div>

      {/* Tap zones. Behind the content, so buttons inside a card win. */}
      <button
        type="button"
        aria-label="Previous"
        onClick={() => go(-1)}
        className="absolute inset-y-0 left-0 z-10 w-[28%] cursor-default outline-none"
        tabIndex={-1}
      />
      <button
        type="button"
        aria-label="Next"
        onClick={() => go(1)}
        className="absolute inset-y-0 right-0 z-10 w-[72%] cursor-default outline-none"
        tabIndex={-1}
      />

      {/*
        Deliberately no AnimatePresence and no exit animation.

        `mode="wait"` holds the next card back until the previous one's exit
        finishes — and an exit only finishes if requestAnimationFrame is
        running. Background the tab, or open this anywhere frames are
        throttled, and the deck freezes on whatever card it was showing while
        the index quietly keeps counting up behind it.

        Keying on the index instead means the new card mounts the moment the
        state changes. If frames are paused the entrance simply does not play,
        which is a far better failure than a deck that stops working.
      */}
      <motion.div
        key={index}
        className="pointer-events-none relative z-20 flex h-full w-full items-center justify-center px-6 py-16"
        initial={reduced ? false : { opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Cards opt their own controls back in with pointer-events-auto.
            `max-h-full` keeps a long card from spilling off a short phone,
            since the deck has taken the page scroll away. */}
        <div className="max-h-full w-full max-w-lg">{children}</div>
      </motion.div>

      {/* Shown once, until the first advance */}
      {!hintGone && index === 0 && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-7 z-30 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
        >
          <span className="tz-float font-sans text-[0.6rem] uppercase tracking-[0.34em] text-[var(--muted)]">
            tap to continue →
          </span>
        </motion.div>
      )}

      {/* Going back is invisible otherwise: the left third of the screen is a
          button with nothing in it, and nobody discovers that on their own. */}
      {index > 0 && (
        <motion.button
          type="button"
          onClick={() => go(-1)}
          className="absolute bottom-6 left-5 z-30 rounded-full px-3 py-2 font-sans text-[0.62rem] uppercase tracking-[0.28em] text-[var(--muted)] transition hover:text-[var(--maroon)] sm:left-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          ← back
        </motion.button>
      )}

      {/* Position, for anyone who wants to know how much is left */}
      <div className="pointer-events-none absolute bottom-6 right-5 z-30 font-sans text-[0.62rem] tracking-[0.2em] text-[var(--muted)] sm:right-8">
        {index + 1} / {count}
      </div>
    </div>
  );
}
