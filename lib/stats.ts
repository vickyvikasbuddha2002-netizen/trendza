import { isSupabaseConfigured, supabase } from "./supabase";
import type { SiteStats } from "./types";

const EMPTY: SiteStats = { visits: 0, wishes: 0, wishlists: 0, agreements: 0 };

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

/**
 * Deliberately a no-op. The lists total is counted from the table itself in
 * `fetchStats`, so there is no counter to keep in step and nothing to drift.
 */
export async function recordWishlist(): Promise<void> {}

export function recordAgreement(): Promise<void> {
  return bump("agreements");
}

async function bump(field: keyof SiteStats): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    // A Postgres function, so simultaneous visitors cannot lose an
    // increment the way a read-modify-write from the client would.
    await supabase.rpc("bump_stat", { p_field: field });
  } catch {
    // A counter is decoration. It must never break the actual flow.
  }
}

export async function fetchStats(): Promise<SiteStats> {
  // Misconfiguration shows zeroes rather than throwing. A counter is
  // decoration; it must never be the thing that breaks a page.
  if (!isSupabaseConfigured) return EMPTY;

  // The three long-standing totals and the wishlist count are fetched
  // separately on purpose. Postgres rejects an entire select for one unknown
  // column, so asking for all four together meant a single missing column
  // blanked every number on the page. Kept apart, each can fail alone.
  const [totals, lists] = await Promise.all([
    (async () => {
      try {
        const { data, error } = await supabase
          .from("stats")
          .select("visits, wishes, agreements")
          .eq("id", "global")
          .single();
        if (error || !data) return null;
        return data;
      } catch {
        return null;
      }
    })(),
    // Counted from the table itself rather than a counter column: it cannot
    // drift, and it needs no migration to start working.
    (async () => {
      try {
        const { data, error } = await supabase.rpc("wishlist_stats");
        if (error) return 0;
        const row = Array.isArray(data) ? data[0] : data;
        return Number(row?.created ?? 0);
      } catch {
        return 0;
      }
    })(),
  ]);

  return {
    visits: Number(totals?.visits ?? 0),
    wishes: Number(totals?.wishes ?? 0),
    wishlists: lists,
    agreements: Number(totals?.agreements ?? 0),
  };
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
