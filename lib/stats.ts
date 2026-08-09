import { supabase } from "./supabase";
import type { SiteStats } from "./types";

const EMPTY: SiteStats = { visits: 0, wishes: 0, agreements: 0 };

/**
 * Counted once per browser session rather than per page view — a refresh
 * or a bounce between pages would otherwise inflate the number until it
 * stopped meaning anything.
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
    // A Postgres function, so simultaneous visitors cannot lose an
    // increment the way a read-modify-write from the client would.
    await supabase.rpc("bump_stat", { p_field: field });
  } catch {
    // A counter is decoration. It must never break the actual flow.
  }
}

export async function fetchStats(): Promise<SiteStats> {
  try {
    const { data, error } = await supabase
      .from("stats")
      .select("visits, wishes, agreements")
      .eq("id", "global")
      .single();
    if (error || !data) return EMPTY;
    return {
      visits: Number(data.visits ?? 0),
      wishes: Number(data.wishes ?? 0),
      agreements: Number(data.agreements ?? 0),
    };
  } catch {
    return EMPTY;
  }
}

/**
 * Polls rather than using Supabase Realtime.
 *
 * Realtime would need replication enabled on the table and holds a
 * websocket open; for three numbers that change slowly, a poll gives the
 * same visible effect with far less to go wrong.
 */
export function watchStats(onChange: (stats: SiteStats) => void): () => void {
  let stopped = false;

  const tick = async () => {
    const stats = await fetchStats();
    if (!stopped) onChange(stats);
  };

  void tick();
  const timer = window.setInterval(tick, 15_000);

  return () => {
    stopped = true;
    window.clearInterval(timer);
  };
}
