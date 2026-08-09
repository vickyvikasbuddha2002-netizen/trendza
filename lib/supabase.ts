import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * The browser client.
 *
 * `persistSession: false` because Trendza has no accounts — there is no
 * session to keep, and skipping it avoids writing anything to localStorage.
 *
 * The anon key is public by design and ships inside the JavaScript bundle.
 * What protects the data is row level security, not this key: the tables
 * have no SELECT policy at all, so a wish can only be read through the
 * `get_wish` function, which requires an exact 12-character id.
 */
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const PHOTO_BUCKET = "wishes";
