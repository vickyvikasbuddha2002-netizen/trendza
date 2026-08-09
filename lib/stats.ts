import { doc, increment, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { SiteStats } from "./types";

const statsRef = doc(db, "stats", "global");

const EMPTY: SiteStats = { visits: 0, wishes: 0, agreements: 0 };

/**
 * Counted once per browser session, not per page view — otherwise a
 * refresh or a bounce between pages inflates the number and it stops
 * meaning anything.
 */
export async function recordVisit(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem("tz_counted_visit")) return;
    sessionStorage.setItem("tz_counted_visit", "1");
  } catch {
    return; // Private mode with storage disabled: skip rather than double-count.
  }
  await bump("visits");
}

export function recordWish(): Promise<void> {
  return bump("wishes");
}

export function recordAgreement(): Promise<void> {
  return bump("agreements");
}

async function bump(field: keyof SiteStats): Promise<void> {
  try {
    // merge:true creates the doc on the very first write, so there is no
    // seeding step to remember.
    await setDoc(statsRef, { [field]: increment(1) }, { merge: true });
  } catch {
    // A counter is decoration. It must never break the actual flow.
  }
}

/** Live subscription so the numbers tick up while someone is looking. */
export function watchStats(onChange: (stats: SiteStats) => void): () => void {
  return onSnapshot(
    statsRef,
    (snap) => onChange({ ...EMPTY, ...(snap.data() as Partial<SiteStats> | undefined) }),
    () => onChange(EMPTY),
  );
}
