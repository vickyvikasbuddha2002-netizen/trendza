"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * The gold thread running down the page.
 *
 * It is the connective motif, the transition device and the scroll progress
 * indicator all at once — which is what a rakhi actually is, a thread that
 * ties things together. Driven by scroll progress rather than a scroll
 * listener, so it never blocks the main thread.
 */
export function ThreadSpine() {
  const { scrollYProgress } = useScroll();
  const drawn = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-3 z-20 w-8 sm:left-8 sm:w-12"
    >
      <svg
        viewBox="0 0 40 1000"
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
      >
        {/* Ghost of the full path, so the thread reads as continuing beyond
            where the reader has got to. */}
        <path
          d="M20 0 C 44 150, -4 300, 20 450 C 44 600, -4 750, 20 900 C 32 960, 20 980, 20 1000"
          stroke="var(--gold)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.13"
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d="M20 0 C 44 150, -4 300, 20 450 C 44 600, -4 750, 20 900 C 32 960, 20 980, 20 1000"
          stroke="var(--gold)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: drawn }}
        />
      </svg>
    </div>
  );
}
