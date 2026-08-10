"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The shop invitation, hidden as something to notice rather than a button.
 *
 * A button at the end of a heartfelt page gets read as an advert and skipped.
 * This is a small wrapped parcel that drifts in half off the right edge with
 * a gold thread trailing back to it — peripheral movement in an otherwise
 * still margin, which the eye catches on its own. Touching it pulls it in
 * and it opens into the offer.
 *
 * It only ever appears after the closing bow, so it cannot intrude on the
 * story itself.
 */
export function GiftThread({ from }: { from: string }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    /* Breaks out of the narrow closing column to the full viewport, so the
       parcel actually sits at the screen edge. Half-hidden in the margin is
       what makes the eye go to it; centred in a column it is just a button
       with a picture on it. The body has overflow-x hidden, so the
       full-width breakout cannot cause a sideways scroll. */
    <div className="relative left-1/2 mt-16 w-screen -translate-x-1/2 px-5 sm:px-8">
      <motion.div
        className="relative flex items-center justify-end"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.2, delay: 0.6 }}
      >
        {/* The thread, drawing itself in from the right margin */}
        <motion.svg
          viewBox="0 0 300 40"
          preserveAspectRatio="none"
          className="pointer-events-none absolute right-0 h-10 w-full max-w-md"
          fill="none"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, margin: "-10%" }}
        >
          <motion.path
            d="M300 20 C 220 20, 200 8, 150 12 C 100 16, 70 26, 0 22"
            stroke="var(--gold)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.75"
            vectorEffect="non-scaling-stroke"
            variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1 } }}
            transition={{ duration: 2, delay: 0.8, ease: EASE }}
          />
        </motion.svg>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Something else you could send"
          className="relative z-10 -mr-9 sm:-mr-12"
        >
          <motion.div
            className={reduced ? "" : "tz-float"}
            animate={open ? { x: -18, rotate: 0 } : { x: 0, rotate: -4 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <svg viewBox="0 0 72 72" className="w-16 sm:w-20" fill="none">
              {/* parcel */}
              <rect
                x="14"
                y="28"
                width="44"
                height="32"
                rx="3"
                fill="var(--ivory-deep)"
                stroke="var(--gold)"
                strokeWidth="1.6"
              />
              <path d="M36 28v32" stroke="var(--gold)" strokeWidth="1.6" />
              <path d="M14 40h44" stroke="var(--gold)" strokeWidth="1.6" opacity="0.6" />
              {/* bow */}
              <path
                d="M36 28 C 26 18, 14 20, 17 27 C 19 32, 31 30, 36 28"
                stroke="var(--gold)"
                strokeWidth="1.8"
                fill="var(--gold)"
                fillOpacity="0.1"
              />
              <path
                d="M36 28 C 46 18, 58 20, 55 27 C 53 32, 41 30, 36 28"
                stroke="var(--gold)"
                strokeWidth="1.8"
                fill="var(--gold)"
                fillOpacity="0.1"
              />
              <circle cx="36" cy="27.5" r="3.4" fill="var(--gold)" />
            </svg>
          </motion.div>
        </button>
      </motion.div>

      {/* The offer, only once they have reached for it */}
      <motion.div
        initial={false}
        animate={
          open
            ? { height: "auto", opacity: 1, marginTop: 20 }
            : { height: 0, opacity: 0, marginTop: 0 }
        }
        transition={{ duration: 0.75, ease: EASE }}
        className="overflow-hidden"
      >
        <div className="rounded-2xl border border-[var(--gold)]/40 bg-[var(--ivory-deep)]/45 px-6 py-6 text-left">
          <p className="font-display text-xl font-light italic leading-relaxed text-[var(--maroon)]">
            A wish arrives instantly. A rakhi still has to be posted.
          </p>
          <p className="mt-3 font-sans text-[0.78rem] leading-relaxed text-[var(--muted)]">
            If you were going to send {from} something anyway, today is a better
            day for it than the 27th.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-block rounded-full bg-[var(--maroon)] px-6 py-3 font-sans text-[0.78rem] tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
          >
            See what still arrives in time →
          </Link>
        </div>
      </motion.div>

      {!open && (
        <motion.p
          className="mt-2 text-right font-sans text-[0.6rem] uppercase tracking-[0.3em] text-[var(--muted)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 2.4 }}
        >
          pull the thread
        </motion.p>
      )}
    </div>
  );
}
