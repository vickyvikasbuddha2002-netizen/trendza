/**
 * End-to-end encryption for wish contents.
 *
 * A random AES-256-GCM key is generated in the sender's browser, and travels
 * to the recipient in the URL *fragment* (`/w/abc#k=...`). Browsers never put
 * the fragment in an HTTP request, so the key never reaches the server, never
 * appears in access logs, and is not in the Firestore record.
 *
 * The consequence, and it is not reversible: whoever holds the link holds the
 * only copy of the key. Lose the fragment and the photos are unrecoverable —
 * there is no reset, by design.
 */

const IV_BYTES = 12; // GCM standard

function subtle(): SubtleCrypto {
  const c = globalThis.crypto?.subtle;
  if (!c) {
    throw new Error(
      "This browser cannot encrypt (Web Crypto unavailable). A secure https:// connection is required.",
    );
  }
  return c;
}

export async function generateKey(): Promise<CryptoKey> {
  return subtle().generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await subtle().exportKey("raw", key);
  return toBase64Url(new Uint8Array(raw));
}

export async function importKey(encoded: string): Promise<CryptoKey> {
  return subtle().importKey("raw", fromBase64Url(encoded), { name: "AES-GCM" }, true, [
    "encrypt",
    "decrypt",
  ]);
}

/** Returns `iv || ciphertext` as one blob, ready to upload. */
export async function encryptBytes(key: CryptoKey, data: ArrayBuffer): Promise<Blob> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = await subtle().encrypt({ name: "AES-GCM", iv }, key, data);

  const out = new Uint8Array(IV_BYTES + cipher.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(cipher), IV_BYTES);
  return new Blob([out], { type: "application/octet-stream" });
}

export async function decryptBytes(
  key: CryptoKey,
  payload: ArrayBuffer,
): Promise<ArrayBuffer> {
  if (payload.byteLength <= IV_BYTES) throw new Error("Encrypted data is truncated");
  const iv = new Uint8Array(payload, 0, IV_BYTES);
  const cipher = new Uint8Array(payload, IV_BYTES);
  return subtle().decrypt({ name: "AES-GCM", iv }, key, cipher);
}

export async function encryptText(key: CryptoKey, text: string): Promise<string> {
  const blob = await encryptBytes(key, new TextEncoder().encode(text).buffer as ArrayBuffer);
  return toBase64Url(new Uint8Array(await blob.arrayBuffer()));
}

export async function decryptText(key: CryptoKey, encoded: string): Promise<string> {
  const plain = await decryptBytes(key, fromBase64Url(encoded));
  return new TextDecoder().decode(plain);
}

/** Reads `#k=...` without leaving the key anywhere it could be logged. */
export function keyFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  const value = new URLSearchParams(hash).get("k");
  return value && value.length >= 40 ? value : null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Returns a concrete ArrayBuffer — WebCrypto's BufferSource will not accept
 *  a Uint8Array whose backing buffer is only known to be ArrayBufferLike. */
function fromBase64Url(encoded: string): ArrayBuffer {
  const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return buffer;
}
