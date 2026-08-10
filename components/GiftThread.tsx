"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The shop invitation at the end of a wish.
 *
 * This was originally a parcel you had to tap to open. That was a mistake:
 * hiding the offer behind curiosity means it only converts the curious, and
 * most people are not. The parcel now earns its keep as the thing that draws
 * the eye — hanging off the right edge with a thread trailing back to it,
 * moving slightly in an otherwise still margin — while the offer itself is
 * plainly visible and one tap from the shop.
 */
export function GiftThread({ from }: { from: string }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="relative left-1/2 mt-14 w-screen -translate-x-1/2 px-5 sm:px-8"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1.1, ease: EASE }}
    >
      <div className="relative mx-auto max-w-md overflow-visible rounded-2xl border border-[var(--gold)]/40 bg-[var(--ivory-deep)]/50 px-6 py-6 pr-16 text-left sm:pr-20">
        {/* The thread, running out to the parcel on the right edge */}
        <svg
          aria-hidden
          viewBox="0 0 200 20"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -right-8 top-1/2 h-5 w-40 -translate-y-1/2 sm:-right-10"
          fill="none"
        >
          <motion.path
            d="M0 10 C 60 4, 120 16, 200 10"
            stroke="var(--gold)"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.8"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, delay: 0.5, ease: EASE }}
          />
        </svg>

        <div
          aria-hidden
          className={`absolute -right-7 top-1/2 -translate-y-1/2 sm:-right-9 ${
            reduced ? "" : "tz-float"
          }`}
        >
          <svg viewBox="0 0 72 72" className="w-16 sm:w-20" fill="none">
            <rect
              x="14"
              y="28"
              width="44"
              height="32"
              rx="3"
              fill="var(--ivory)"
              stroke="var(--gold)"
              strokeWidth="1.6"
            />
            <path d="M36 28v32" stroke="var(--gold)" strokeWidth="1.6" />
            <path d="M14 40h44" stroke="var(--gold)" strokeWidth="1.6" opacity="0.6" />
            <path
              d="M36 28 C 26 18, 14 20, 17 27 C 19 32, 31 30, 36 28"
              stroke="var(--gold)"
              strokeWidth="1.8"
              fill="var(--gold)"
              fillOpacity="0.12"
            />
            <path
              d="M36 28 C 46 18, 58 20, 55 27 C 53 32, 41 30, 36 28"
              stroke="var(--gold)"
              strokeWidth="1.8"
              fill="var(--gold)"
              fillOpacity="0.12"
            />
            <circle cx="36" cy="27.5" r="3.4" fill="var(--gold)" />
          </svg>
        </div>

        <p className="font-display text-xl font-light italic leading-relaxed text-[var(--maroon)]">
          A wish arrives instantly. A rakhi has to be posted.
        </p>
        <p className="mt-2.5 font-sans text-[0.76rem] leading-relaxed text-[var(--muted)]">
          If you were going to send {from} something anyway, today beats the 27th.
        </p>

        <Link
          href="/shop"
          className="mt-5 inline-block rounded-full bg-[var(--maroon)] px-6 py-3 font-sans text-[0.78rem] tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
        >
          See what still arrives in time →
        </Link>
      </div>
    </motion.div>
  );
}
