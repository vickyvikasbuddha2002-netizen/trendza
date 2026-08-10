import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Deletes wishes whose time is up, and the encrypted photos with them.
 *
 * Runs daily on a Vercel cron (see vercel.json). Without it nothing ever
 * leaves storage: the app refuses to *serve* an expired wish the moment it
 * expires, so the promise to the sender is kept, but the files themselves
 * would sit in the bucket forever and eventually fill it.
 *
 * Uses the service role key, which bypasses row level security — that is the
 * whole point, since the public key deliberately cannot delete anything.
 * That key is server-only and must never be prefixed NEXT_PUBLIC_.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return Response.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not set; nothing can be cleaned up" },
      { status: 500 },
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: expired, error: findError } = await admin
    .from("wishes")
    .select("id, retention")
    .not("expires_at", "is", null)
    .lt("expires_at", new Date().toISOString())
    .limit(500);

  if (findError) {
    return Response.json({ error: findError.message }, { status: 500 });
  }
  if (!expired?.length) {
    return Response.json({ deletedWishes: 0, deletedFiles: 0 });
  }

  let deletedFiles = 0;
  const failures: string[] = [];

  for (const wish of expired) {
    const prefix = `${wish.retention}/${wish.id}`;
    const { data: files, error: listError } = await admin.storage
      .from("wishes")
      .list(prefix);

    if (listError) {
      failures.push(`${wish.id}: ${listError.message}`);
      continue;
    }
    if (!files?.length) continue;

    const paths = files.map((f) => `${prefix}/${f.name}`);
    const { error: removeError } = await admin.storage.from("wishes").remove(paths);

    if (removeError) failures.push(`${wish.id}: ${removeError.message}`);
    else deletedFiles += paths.length;
  }

  // Rows go last. If a file delete failed, the row survives so the next run
  // retries it — losing the row first would orphan the files permanently,
  // with nothing left pointing at them.
  const clearable = expired
    .filter((w) => !failures.some((f) => f.startsWith(`${w.id}:`)))
    .map((w) => w.id);

  if (clearable.length) {
    const { error: deleteError } = await admin
      .from("wishes")
      .delete()
      .in("id", clearable);
    if (deleteError) {
      return Response.json(
        { deletedFiles, deletedWishes: 0, error: deleteError.message },
        { status: 500 },
      );
    }
  }

  return Response.json({
    deletedWishes: clearable.length,
    deletedFiles,
    retried: failures.length,
  });
}
