import { DEMO_WISH } from "./demo";
import { isRetention, type Agreement, type Wish } from "./types";

/**
 * Server-side reads go over the Firestore REST API rather than the JS SDK.
 *
 * `generateMetadata` and the OG image routes run on the server, and the
 * client SDK opens a long-lived listener channel that does not belong in a
 * request/response cycle. REST is a plain fetch, caches cleanly, and reads
 * are already public under our security rules.
 *
 * Note that everything sensitive in a wish arrives here still encrypted. The
 * server can read the two names and the expiry, and nothing else.
 */

const PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

type RestValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  nullValue?: null;
  arrayValue?: { values?: RestValue[] };
  mapValue?: { fields?: Record<string, RestValue> };
};

function decode(value: RestValue): unknown {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return Date.parse(value.timestampValue);
  if (value.nullValue !== undefined) return null;
  if (value.arrayValue) return (value.arrayValue.values ?? []).map(decode);
  if (value.mapValue) return decodeFields(value.mapValue.fields ?? {});
  return null;
}

function decodeFields(fields: Record<string, RestValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) out[key] = decode(value);
  return out;
}

async function readDoc(
  collection: string,
  id: string,
): Promise<Record<string, unknown> | null> {
  if (!PROJECT || !API_KEY) return null;
  if (!/^[a-z0-9]{6,32}$/.test(id)) return null;

  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/` +
    `${collection}/${encodeURIComponent(id)}?key=${API_KEY}`;

  try {
    // Short revalidate: a wish is immutable once created, but an agreement
    // gains its second signature and the page should catch up quickly.
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    const body = (await res.json()) as { fields?: Record<string, RestValue> };
    if (!body.fields) return null;
    return decodeFields(body.fields);
  } catch {
    return null;
  }
}

export type WishResult =
  | { status: "ok"; wish: Wish }
  | { status: "expired"; to: string; from: string }
  | { status: "missing" };

export async function getWishServer(id: string): Promise<WishResult> {
  if (id === "demo") return { status: "ok", wish: DEMO_WISH };

  const data = await readDoc("wishes", id);
  if (!data) return { status: "missing" };

  const expiresAt = typeof data.expiresAt === "number" ? data.expiresAt : null;

  // Expiry is enforced here, not left to the storage sweep. Cloud Storage
  // lifecycle rules and Firestore TTL both run as daily batches, so the file
  // can outlive its deadline by hours — the promise made to the sender is
  // kept by refusing to serve it, immediately and to the second.
  if (expiresAt !== null && Date.now() > expiresAt) {
    return {
      status: "expired",
      to: String(data.to ?? ""),
      from: String(data.from ?? ""),
    };
  }

  return {
    status: "ok",
    wish: {
      id,
      to: String(data.to ?? ""),
      from: String(data.from ?? ""),
      message: String(data.message ?? ""),
      photos: Array.isArray(data.photos) ? (data.photos as Wish["photos"]) : [],
      createdAt: Number(data.createdAt ?? 0),
      retention: isRetention(data.retention) ? data.retention : "forever",
      expiresAt,
    },
  };
}

export async function getAgreementServer(id: string): Promise<Agreement | null> {
  const data = await readDoc("agreements", id);
  if (!data) return null;
  return {
    id,
    partyA: String(data.partyA ?? ""),
    partyB: String(data.partyB ?? ""),
    clauses: Array.isArray(data.clauses) ? (data.clauses as string[]) : [],
    signatureA: String(data.signatureA ?? ""),
    signatureB: data.signatureB ? String(data.signatureB) : null,
    createdAt: Number(data.createdAt ?? 0),
    signedAt: data.signedAt ? Number(data.signedAt) : null,
  };
}
