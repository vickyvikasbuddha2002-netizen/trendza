import { PHOTO_BUCKET, supabase } from "./supabase";
import { newId } from "./id";
import { compressImage } from "./compress";
import { recordWish } from "./stats";
import {
  decryptBytes,
  decryptText,
  encryptBytes,
  encryptText,
  exportKey,
  generateKey,
} from "./crypto";
import { RETENTION_MS, type Retention, type Wish, type WishPhoto } from "./types";

export interface DraftPhoto {
  file: File;
  note: string;
  previewUrl: string;
}

export interface CreatedWish {
  id: string;
  /** Belongs in the URL fragment. Never send this to a server. */
  key: string;
}

/**
 * Compresses, encrypts and uploads every photo, then writes the wish row.
 *
 * The two names stay in plaintext so the WhatsApp preview card has something
 * to show. Everything else — the message, the per-photo notes, the photos
 * themselves — is encrypted with a key that never leaves this browser.
 */
export async function createWish(
  input: {
    to: string;
    from: string;
    message: string;
    photos: DraftPhoto[];
    retention: Retention;
  },
  onProgress?: (done: number, total: number) => void,
): Promise<CreatedWish> {
  const id = newId();
  const key = await generateKey();
  const total = input.photos.length;
  const uploaded: WishPhoto[] = [];

  // The retention class leads the storage path so the nightly cleanup can
  // find everything in one expired class with a single prefix query.
  const prefix = `${input.retention}/${id}`;

  for (let i = 0; i < total; i++) {
    const draft = input.photos[i];
    const { blob, w, h } = await compressImage(draft.file);
    const sealed = await encryptBytes(key, await blob.arrayBuffer());

    const path = `${prefix}/${i}.bin`;
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, sealed, {
      contentType: "application/octet-stream",
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw new Error(describeUploadFailure(error));

    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    const note = draft.note.trim();
    uploaded.push({
      url: data.publicUrl,
      w,
      h,
      ...(note ? { note: await encryptText(key, note) } : {}),
    });

    onProgress?.(i + 1, total);
  }

  const window = RETENTION_MS[input.retention];
  const expiresAt = window === null ? null : new Date(Date.now() + window);

  const { error } = await supabase.from("wishes").insert({
    id,
    to_name: input.to.trim(),
    from_name: input.from.trim(),
    message: await encryptText(key, input.message.trim()),
    photos: uploaded,
    retention: input.retention,
    expires_at: expiresAt?.toISOString() ?? null,
  });
  if (error) throw new Error(describeInsertFailure(error));

  void recordWish();

  return { id, key: await exportKey(key) };
}

export interface OpenPhoto {
  objectUrl: string;
  note?: string;
  w: number;
  h: number;
}

/**
 * Fetches the ciphertext and decrypts it in the recipient's browser.
 *
 * Object URLs rather than data URLs — six photos as base64 would put
 * megabytes of string into the DOM.
 */
export async function openWish(
  wish: Wish,
  key: CryptoKey,
): Promise<{ message: string; photos: OpenPhoto[] }> {
  const message = wish.message ? await decryptText(key, wish.message) : "";

  const photos = await Promise.all(
    wish.photos.map(async (photo) => {
      const res = await fetch(photo.url);
      if (!res.ok) throw new Error(`Could not fetch a photo (${res.status})`);

      const plain = await decryptBytes(key, await res.arrayBuffer());
      const objectUrl = URL.createObjectURL(new Blob([plain], { type: "image/webp" }));

      return {
        objectUrl,
        w: photo.w,
        h: photo.h,
        ...(photo.note ? { note: await decryptText(key, photo.note) } : {}),
      };
    }),
  );

  return { message, photos };
}

function describeUploadFailure(err: { message?: string }): string {
  const message = err.message ?? "";

  if (/bucket not found/i.test(message)) {
    return "The photo storage bucket does not exist yet. Run supabase-setup.sql in the Supabase SQL editor.";
  }
  if (/row-level security|policy/i.test(message)) {
    return "Uploads are blocked by the storage policy. Run supabase-setup.sql in the Supabase SQL editor.";
  }
  if (/exceeded the maximum|payload too large|413/i.test(message)) {
    return "One of those photos is too large even after compression. Try a smaller one.";
  }
  if (/fetch|network/i.test(message)) {
    return "Could not reach photo storage. Please check your connection and try again.";
  }
  return message ? `Photo upload failed: ${message}` : "Photo upload failed. Please try again.";
}

function describeInsertFailure(err: { message?: string; code?: string }): string {
  const message = err.message ?? "";

  if (/row-level security|policy/i.test(message)) {
    return "Saving the wish was blocked by a database policy. Run supabase-setup.sql in the Supabase SQL editor.";
  }
  if (/relation .* does not exist/i.test(message)) {
    return "The database tables have not been created yet. Run supabase-setup.sql in the Supabase SQL editor.";
  }
  return message ? `Could not save the wish: ${message}` : "Could not save the wish. Please try again.";
}
