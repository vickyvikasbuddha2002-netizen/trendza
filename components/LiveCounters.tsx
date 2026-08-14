"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { recordVisit, watchStats } from "@/lib/stats";
import type { SiteStats } from "@/lib/types";

/**
 * Live social proof. Polled rather than fetched once, so the numbers move
 * while someone is looking at them — which is the whole reason to show a
 * counter at all.
 */
export function LiveCounters() {
  const [stats, setStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    void recordVisit();
    return watchStats(setStats);
  }, []);

  return (
    <div>
      <div className="mb-5 flex items-center justify-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gold)] opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
        </span>
        <span className="font-sans text-[0.58rem] uppercase tracking-[0.3em] text-[var(--muted)]">
          Live
        </span>
      </div>

      {/* Two by two on a phone, one row on anything wider. Four of these
          side by side on a 375px screen squeezes the numbers until they
          stop reading as numbers. */}
      <div className="mx-auto grid max-w-md grid-cols-2 gap-y-6 sm:flex sm:max-w-none sm:items-stretch sm:justify-center sm:gap-5">
        <Counter value={stats?.visits} label="people here" />
        <Divider />
        <Counter value={stats?.wishes} label="wishes made" />
        <Divider />
        <Counter value={stats?.wishlists} label="lists made" />
        <Divider />
        <Counter value={stats?.agreements} label="accords signed" />
      </div>
    </div>
  );
}

function Divider() {
  return <div aria-hidden className="hidden w-px self-stretch bg-[var(--gold)]/25 sm:block" />;
}

function Counter({ value, label }: { value?: number; label: string }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString("en-IN"));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (value === undefined) return;
    setReady(true);
    // Count up from wherever it currently sits, so live updates tick rather
    // than jumping from zero every time.
    const controls = animate(motionValue, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [value, motionValue]);

  return (
    <div className="min-w-[5.5rem] px-1 text-center sm:min-w-[7rem]">
      <motion.div
        className="font-display text-3xl font-light text-[var(--maroon)] sm:text-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0.25 }}
        transition={{ duration: 0.6 }}
      >
        {ready ? <motion.span>{rounded}</motion.span> : <span>—</span>}
      </motion.div>
      <div className="mt-1.5 font-sans text-[0.58rem] uppercase tracking-[0.22em] text-[var(--muted)] sm:text-[0.62rem]">
        {label}
      </div>
    </div>
  );
}
