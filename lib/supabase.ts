import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * The browser client, created on first use rather than on import.
 *
 * `createClient` throws when the key is missing, and prerendering evaluates
 * every imported module — so building with the env vars absent used to take
 * the entire build down with "supabaseKey is required", from a component
 * that never actually calls Supabase during prerender.
 *
 * Deferring construction means importing this module is always safe. A
 * genuinely missing key now surfaces where it can be handled: at the call
 * site, at runtime, as a caught error rather than a failed deploy.
 *
 * `persistSession: false` because Trendza has no accounts. The anon key is
 * public by design; what protects the data is row level security — the
 * tables have no SELECT policy, so wishes are only readable through a
 * function that demands an exact 12-character id.
 */
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    if (!url || !anonKey) {
      throw new Error(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
          "NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.",
      );
    }
    client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/** Proxied so call sites read as `supabase.from(...)` with no lazy plumbing. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getClient();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const isSupabaseConfigured = Boolean(url && anonKey);

export const PHOTO_BUCKET = "wishes";
