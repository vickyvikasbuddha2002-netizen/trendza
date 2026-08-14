"use client";

import { motion } from "framer-motion";
import { useState } from "react";

/**
 * Act 0 and Act 1 — the sealed letter, and the untying.
 *
 * The tap here is doing two jobs. It creates the beat of anticipation that
 * makes the first photograph feel earned, and it is the user gesture that
 * browsers require before any audio may play. There is no way to start the
 * score without it.
 */
export function SealedLetter({
  to,
  from,
  onOpen,
  onFirstTouch,
  waiting = false,
}: {
  to: string;
  from: string;
  onOpen: () => void;
  /**
   * Fires synchronously on the tap, before anything async. This is the only
   * moment a browser will let audio start, so it cannot wait for the untie.
   */
  onFirstTouch?: () => void;
  /** Untied, but the photographs are still downloading and decrypting. */
  waiting?: boolean;
}) {
  const [untying, setUntying] = useState(false);

  const begin = () => {
    if (untying) return;
    onFirstTouch?.();
    setUntying(true);
    // Let the knot loosen and the flap lift before handing over to the story.
    window.setTimeout(onOpen, 1650);
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: "blur(6px)" }}
      transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.p
        className="mb-1 font-sans text-[0.68rem] uppercase tracking-[0.42em] text-[var(--muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: untying ? 0 : 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        A rakhi wish
      </motion.p>

      <motion.h1
        className="mb-10 text-center font-display text-[2.7rem] font-light leading-none text-[var(--maroon)] sm:text-6xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        For {to}
      </motion.h1>

      <button
        type="button"
        onClick={begin}
        aria-label={`Open the wish for ${to}`}
        className="group relative outline-none"
      >
        <motion.div
          className={untying ? "" : "tz-breathe"}
          animate={untying ? { scale: 1.06, y: -8 } : {}}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg
            viewBox="0 0 320 230"
            className="w-[min(78vw,26rem)] drop-shadow-[0_18px_40px_rgba(110,27,36,0.13)]"
            fill="none"
          >
            {/* Body */}
            <rect
              x="22"
              y="52"
              width="276"
              height="156"
              rx="9"
              fill="var(--ivory-deep)"
              stroke="var(--gold)"
              strokeOpacity="0.5"
              strokeWidth="1.4"
            />
            {/* Fold lines, so it reads as a folded letter rather than a box */}
            <path
              d="M22 208 L160 128 L298 208"
              stroke="var(--gold)"
              strokeOpacity="0.28"
              strokeWidth="1.2"
            />

            {/* Flap — lifts away as the thread lets go */}
            <motion.path
              d="M22 61 C 22 55, 27 52, 33 52 L287 52 C 293 52, 298 55, 298 61 L160 152 Z"
              fill="var(--ivory)"
              stroke="var(--gold)"
              strokeOpacity="0.55"
              strokeWidth="1.4"
              style={{ transformOrigin: "160px 52px" }}
              animate={untying ? { rotateX: -168, y: -6 } : { rotateX: 0 }}
              transition={{ duration: 1.15, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />

            {/* The thread, tied across */}
            <motion.path
              d="M0 132 L320 132"
              stroke="var(--gold)"
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={untying ? { pathLength: 0, opacity: 0 } : { pathLength: 1 }}
              transition={{ duration: 0.95, ease: [0.65, 0, 0.35, 1] }}
            />

            {/* The knot and its two loops */}
            <motion.g
              style={{ transformOrigin: "160px 132px" }}
              animate={
                untying
                  ? { scale: 0.2, rotate: -75, opacity: 0, y: 26 }
                  : { scale: 1, rotate: 0, opacity: 1 }
              }
              transition={{ duration: 0.85, ease: [0.65, 0, 0.35, 1] }}
            >
              <ellipse
                cx="141"
                cy="132"
                rx="17"
                ry="10"
                stroke="var(--gold)"
                strokeWidth="2.2"
                transform="rotate(-18 141 132)"
              />
              <ellipse
                cx="179"
                cy="132"
                rx="17"
                ry="10"
                stroke="var(--gold)"
                strokeWidth="2.2"
                transform="rotate(18 179 132)"
              />
              <path
                d="M150 140 L142 158 M170 140 L178 158"
                stroke="var(--gold)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="160" cy="132" r="6.5" fill="var(--gold)" />
              <circle cx="160" cy="132" r="10" stroke="var(--gold-light)" strokeWidth="1.6" />
            </motion.g>
          </svg>
        </motion.div>
      </button>

      <motion.div
        className="mt-9 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: untying ? 0 : 1 }}
        transition={{ duration: 0.9, delay: untying ? 0 : 1.6 }}
      >
        <span className="font-sans text-[0.7rem] uppercase tracking-[0.34em] text-[var(--maroon-soft)]">
          Tap to untie
        </span>
        <span className="font-sans text-[0.66rem] tracking-wide text-[var(--muted)]">
          from {from} · best with sound on
        </span>
      </motion.div>

      {/* Only appears if decryption outlasts the untie animation — on a slow
          connection with several photographs, silence here reads as broken. */}
      <motion.p
        className="tz-breathe absolute bottom-[14vh] font-display text-lg font-light italic text-[var(--maroon-soft)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: waiting ? 1 : 0 }}
        transition={{ duration: 0.7, delay: waiting ? 0.4 : 0 }}
      >
        unwrapping the photographs…
      </motion.p>
    </motion.div>
  );
}
