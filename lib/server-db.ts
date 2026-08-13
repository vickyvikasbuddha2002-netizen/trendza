import { DEMO_WISH } from "./demo";
import { isRetention, type Agreement, type Wish } from "./types";
import type { Wishlist } from "./wishlist";

/**
 * Server-side reads.
 *
 * These run in `generateMetadata` and the OG image routes, so they use plain
 * fetch against PostgREST rather than the supabase-js client — that lets the
 * result participate in Next's fetch cache, and avoids instantiating a
 * client per request.
 *
 * Everything sensitive arrives here still encrypted. The server can read the
 * two names and the expiry, and nothing else.
 */

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function callRpc<T>(
  fn: string,
  args: Record<string, unknown>,
  revalidate: number,
): Promise<T[] | null> {
  if (!URL_BASE || !ANON) return null;

  try {
    const res = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        apikey: ANON,
        Authorization: `Bearer ${ANON}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      next: { revalidate },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return Array.isArray(body) ? (body as T[]) : [body as T];
  } catch {
    return null;
  }
}

interface WishRow {
  id: string;
  to_name: string;
  from_name: string;
  message: string;
  photos: Wish["photos"];
  retention: string;
  created_at: string;
  expires_at: string | null;
}

interface AgreementRow {
  id: string;
  party_a: string;
  party_b: string;
  clauses: string[];
  signature_a: string;
  signature_b: string | null;
  created_at: string;
  signed_at: string | null;
}

export type WishResult =
  | { status: "ok"; wish: Wish }
  | { status: "expired"; to: string; from: string }
  | { status: "missing" };

export async function getWishServer(id: string): Promise<WishResult> {
  if (id === "demo") return { status: "ok", wish: DEMO_WISH };
  if (!/^[a-z0-9]{6,32}$/.test(id)) return { status: "missing" };

  // get_wish already filters out anything past its expiry, so a hit is
  // always safe to render.
  const rows = await callRpc<WishRow>("get_wish", { p_id: id }, 30);
  const row = rows?.[0];

  if (!row) {
    // Nothing came back. Distinguish "never existed" from "expired" so the
    // reader gets told which, rather than a generic dead end.
    const status = await callRpc<{ status: string; to_name: string; from_name: string }>(
      "wish_status",
      { p_id: id },
      30,
    );
    const found = status?.[0];
    if (found?.status === "expired") {
      return { status: "expired", to: found.to_name, from: found.from_name };
    }
    return { status: "missing" };
  }

  return {
    status: "ok",
    wish: {
      id: row.id,
      to: row.to_name ?? "",
      from: row.from_name ?? "",
      message: row.message ?? "",
      photos: Array.isArray(row.photos) ? row.photos : [],
      createdAt: Date.parse(row.created_at) || 0,
      retention: isRetention(row.retention) ? row.retention : "forever",
      expiresAt: row.expires_at ? Date.parse(row.expires_at) : null,
    },
  };
}

interface WishlistRow {
  id: string;
  from_name: string;
  to_name: string;
  from_gender: string;
  wishes: unknown;
  views: number;
  parent_id: string | null;
  created_at: string;
}

export async function getWishlistServer(id: string): Promise<Wishlist | null> {
  if (!/^[a-z0-9]{4,32}$/.test(id)) return null;

  // No cache: the view counter should reflect reality, and these pages are
  // cheap to render.
  const rows = await callRpc<WishlistRow>("get_wishlist", { p_id: id }, 0);
  const row = rows?.[0];
  if (!row) return null;

  return {
    id: row.id,
    from: row.from_name ?? "",
    to: row.to_name ?? "",
    fromGender: row.from_gender === "m" ? "m" : "f",
    wishes: Array.isArray(row.wishes) ? (row.wishes as Wishlist["wishes"]) : [],
    views: Number(row.views ?? 0),
    parentId: row.parent_id ?? null,
    createdAt: Date.parse(row.created_at) || 0,
  };
}

export async function getAgreementServer(id: string): Promise<Agreement | null> {
  if (!/^[a-z0-9]{6,32}$/.test(id)) return null;

  const rows = await callRpc<AgreementRow>("get_agreement", { p_id: id }, 10);
  const row = rows?.[0];
  if (!row) return null;

  return {
    id: row.id,
    partyA: row.party_a ?? "",
    partyB: row.party_b ?? "",
    clauses: Array.isArray(row.clauses) ? row.clauses : [],
    signatureA: row.signature_a ?? "",
    signatureB: row.signature_b ?? null,
    createdAt: Date.parse(row.created_at) || 0,
    signedAt: row.signed_at ? Date.parse(row.signed_at) : null,
  };
}
