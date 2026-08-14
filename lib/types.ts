/** How long the sender chose to keep the wish alive. */
export type Retention = "24h" | "7d" | "30d" | "forever";

export const RETENTION_MS: Record<Retention, number | null> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  forever: null,
};

export const RETENTION_LABEL: Record<Retention, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
  forever: "forever",
};

export function isRetention(value: unknown): value is Retention {
  return value === "24h" || value === "7d" || value === "30d" || value === "forever";
}

export interface WishPhoto {
  /** Points at ciphertext, not an image. Useless without the key. */
  url: string;
  /** Encrypted; optional, because a note is never required. */
  note?: string;
  w: number;
  h: number;
}

export interface Wish {
  id: string;
  /** Plaintext — the WhatsApp preview card needs something to show. */
  to: string;
  from: string;
  /** Encrypted. Decrypted in the recipient's browser with the fragment key. */
  message: string;
  photos: WishPhoto[];
  createdAt: number;
  retention: Retention;
  /** Null when kept forever. */
  expiresAt: number | null;
  /**
   * Only the /w/demo sample sets this. Real wishes are always encrypted;
   * the demo has to render with no key in the URL.
   */
  plaintext?: boolean;
}

export interface Agreement {
  id: string;
  partyA: string;
  partyB: string;
  clauses: string[];
  /** Data URLs of the finger-drawn signatures. B is null until signed back. */
  signatureA: string;
  signatureB: string | null;
  createdAt: number;
  signedAt: number | null;
}

export interface SiteStats {
  visits: number;
  wishes: number;
  wishlists: number;
  agreements: number;
}
