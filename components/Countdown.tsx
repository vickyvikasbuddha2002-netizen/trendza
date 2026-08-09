"use client";

import { useEffect, useState } from "react";

/** Raksha Bandhan 2026 — Friday 28 August, IST. */
const RAKHI = new Date("2026-08-28T00:00:00+05:30");

export function Countdown() {
  // Rendered only after mount: the days remaining depend on the reader's
  // clock, and computing it during SSR guarantees a hydration mismatch.
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const compute = () =>
      setDays(Math.ceil((RAKHI.getTime() - Date.now()) / 86_400_000));
    compute();
    const timer = window.setInterval(compute, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (days === null) return <span className="opacity-0">·</span>;

  if (days > 1) {
    return (
      <>
        <strong className="font-medium text-[var(--maroon)]">{days} days</strong> until
        Raksha Bandhan
      </>
    );
  }
  if (days === 1) return <>Raksha Bandhan is tomorrow</>;
  if (days === 0) return <>Raksha Bandhan is today</>;
  return <>Happy Raksha Bandhan</>;
}
