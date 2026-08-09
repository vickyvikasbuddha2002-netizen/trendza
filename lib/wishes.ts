import { doc, setDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { newId } from "./id";
import { compressImage } from "./compress";
import { recordWish } from "./stats";
import {
  encryptBytes,
  encryptText,
  exportKey,
  generateKey,
  decryptBytes,
  decryptText,
} from "./crypto";
import { RETENTION_MS, type Retention, type Wish, type WishPhoto } from "./types";

export interface DraftPhoto {
  file: File;
  note: string;
  previewUrl: string;
}

export interface CreatedWish {
  id: string;
  /** Belongs in the URL fragment. Never send this to the server. */
  key: string;
}

/**
 * Compresses, encrypts and uploads every photo, then writes the wish record.
 *
 * Names stay in plaintext so the WhatsApp preview card has something to show.
 * Everything else — the message, the per-photo notes, the photos themselves —
 * is encrypted with a key that never leaves the browser.
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

  // The retention class is baked into the storage path so a single Cloud
  // Storage lifecycle rule per prefix can honour each sender's choice. A
  // bucket-wide rule could only ever enforce one window for everybody.
  const prefix = `wishes/${input.retention}/${id}`;

  for (let i = 0; i < total; i++) {
    const draft = input.photos[i];
    const { blob, w, h } = await compressImage(draft.file);
    const sealed = await encryptBytes(key, await blob.arrayBuffer());

    const storageRef = ref(storage, `${prefix}/${i}.bin`);
    try {
      await uploadBytes(storageRef, sealed, {
        contentType: "application/octet-stream",
        cacheControl: "public, max-age=31536000, immutable",
      });
    } catch (err) {
      throw new Error(describeUploadFailure(err));
    }

    const url = await getDownloadURL(storageRef);
    const note = draft.note.trim();
    uploaded.push({
      url,
      w,
      h,
      ...(note ? { note: await encryptText(key, note) } : {}),
    });

    onProgress?.(i + 1, total);
  }

  const window = RETENTION_MS[input.retention];
  const expiresAt = window === null ? null : Date.now() + window;

  await setDoc(doc(db, "wishes", id), {
    id,
    to: input.to.trim(),
    from: input.from.trim(),
    message: await encryptText(key, input.message.trim()),
    photos: uploaded,
    createdAt: Date.now(),
    retention: input.retention,
    // A real Timestamp, because Firestore's native TTL policy can only be
    // attached to a timestamp field.
    expiresAt: expiresAt === null ? null : Timestamp.fromMillis(expiresAt),
  });

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
 * Object URLs are returned rather than data URLs — a data URL for six photos
 * would put megabytes of base64 into the DOM.
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

/**
 * Firebase's own upload errors are opaque ("storage/unknown"). These map the
 * ones that actually happen onto something a person can act on — the setup
 * failures in particular, which otherwise look identical to a bad connection.
 */
function describeUploadFailure(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";

  if (code === "storage/unauthorized") {
    return "Photo uploads are blocked by the Storage security rules. Publish storage.rules in the Firebase console.";
  }
  if (code === "storage/retry-limit-exceeded" || code === "storage/unknown") {
    return "Could not reach photo storage. If this is a new project, Firebase Storage may not be enabled yet — open the Firebase console, go to Storage, and click Get started.";
  }
  if (code === "storage/quota-exceeded") {
    return "The storage bucket is out of free space.";
  }
  if (code === "storage/canceled") {
    return "The upload was cancelled.";
  }
  return err instanceof Error && err.message
    ? `Photo upload failed: ${err.message}`
    : "Photo upload failed. Please check your connection and try again.";
}
