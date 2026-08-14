import { PHOTO_BUCKET, supabase } from "./supabase";
import { newId } from "./id";
import { CATEGORIES } from "./products";
import { compressImage } from "./compress";
import { recordWishlist } from "./stats";
import { decryptBytes, encryptBytes, exportKey, generateKey, importKey } from "./crypto";

export type Reaction = "request" | "beg" | "mercy" | "threat" | "show" | "celebrate";

/**
 * Five offered, not six. `celebrate` stays in the type so older rows keep
 * rendering, but there is no illustrated character for it — the two
 * celebratory images are both two-person scenes, and a single demand cannot
 * be represented by two people. The spec's own cut list called four enough.
 */
export const REACTIONS: { id: Reaction; label: string }[] = [
  { id: "request", label: "Asking nicely" },
  { id: "show", label: "Counting them off" },
  { id: "beg", label: "Begging" },
  { id: "mercy", label: "Full tears" },
  { id: "threat", label: "Not negotiating" },
];

/**
 * The default escalates as the list grows, so someone who never opens the
 * picker still ends up with an arc rather than six identical faces.
 */
export function defaultReaction(index: number): Reaction {
  return (["request", "show", "beg", "mercy", "threat", "threat"] as const)[
    Math.min(index, 5)
  ];
}

export interface WishImage {
  url: string;
  w: number;
  h: number;
}

export interface WishItem {
  reaction: Reaction;
  /** Max 60 characters. Free text, because the funniest ones have no product. */
  text: string;
  /** Category id from the affiliate catalogue, when picked from the shop. */
  categoryId?: string;
  /** Index of the pick within that category. */
  pickIndex?: number;
  /**
   * Encrypted, exactly like the rakhi photos. The key lives in the link's
   * fragment and never reaches the server, so the promise made on /privacy
   * holds across the whole site rather than only half of it.
   */
  image?: WishImage;
}

/** What the builder holds before anything is uploaded. */
export interface DraftWish extends WishItem {
  file?: File;
  previewUrl?: string;
}

export interface Wishlist {
  id: string;
  from: string;
  to: string;
  fromGender: "f" | "m";
  wishes: WishItem[];
  views: number;
  parentId: string | null;
  createdAt: number;
}

export const MAX_WISHES = 6;
export const MAX_WISH_CHARS = 60;

/** Resolves a wish's affiliate link, if it was picked from the shop. */
export function linkForWish(wish: WishItem): { title: string; url: string } | null {
  if (!wish.categoryId) return null;
  const category = CATEGORIES.find((c) => c.id === wish.categoryId);
  if (!category) return null;
  const pick = category.picks[wish.pickIndex ?? 0] ?? category.picks[0];
  if (!pick) return null;
  return { title: category.title, url: pick.url };
}

export interface CreatedList {
  id: string;
  /** Null when no wish carried a picture — then there is nothing to unlock. */
  key: string | null;
}

export async function createWishlist(input: {
  from: string;
  to: string;
  fromGender: "f" | "m";
  wishes: DraftWish[];
  parentId?: string | null;
}): Promise<CreatedList> {
  const id = newId();

  const kept = input.wishes
    .map((w) => ({ ...w, text: w.text.trim().slice(0, MAX_WISH_CHARS) }))
    .filter((w) => w.text.length > 0)
    .slice(0, MAX_WISHES);

  const needsKey = kept.some((w) => w.file);
  const key = needsKey ? await generateKey() : null;

  const wishes: WishItem[] = [];
  for (let i = 0; i < kept.length; i++) {
    const { file, previewUrl, ...rest } = kept[i];
    void previewUrl;

    if (!file || !key) {
      wishes.push(rest);
      continue;
    }

    const { blob, w, h } = await compressImage(file, 1000, 0.74);
    const sealed = await encryptBytes(key, await blob.arrayBuffer());
    const path = `wishlists/${id}/${i}.bin`;

    const { error: upErr } = await supabase.storage.from(PHOTO_BUCKET).upload(path, sealed, {
      contentType: "application/octet-stream",
      cacheControl: "31536000",
      upsert: false,
    });
    if (upErr) throw new Error(`Could not upload that picture: ${upErr.message}`);

    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    wishes.push({ ...rest, image: { url: data.publicUrl, w, h } });
  }

  const { error } = await supabase.from("wishlists").insert({
    id,
    from_name: input.from.trim().slice(0, 20),
    to_name: input.to.trim().slice(0, 20),
    from_gender: input.fromGender,
    wishes,
    parent_id: input.parentId ?? null,
    views: 0,
  });

  if (error) {
    throw new Error(
      /relation .* does not exist/i.test(error.message)
        ? "The wishlist table does not exist yet. Run supabase-wishlist.sql in the Supabase SQL editor."
        : /row-level security|policy/i.test(error.message)
          ? "Saving was blocked by a database policy. Run supabase-wishlist.sql in the Supabase SQL editor."
          : `Could not save the list: ${error.message}`,
    );
  }

  void recordWishlist();

  return { id, key: key ? await exportKey(key) : null };
}

/** Decrypts a list's pictures in the recipient's browser. */
export async function openWishlistImages(
  wishes: WishItem[],
  encodedKey: string,
): Promise<Record<number, string>> {
  const key = await importKey(encodedKey);
  const out: Record<number, string> = {};

  await Promise.all(
    wishes.map(async (wish, i) => {
      if (!wish.image) return;
      try {
        const res = await fetch(wish.image.url);
        if (!res.ok) return;
        const plain = await decryptBytes(key, await res.arrayBuffer());
        out[i] = URL.createObjectURL(new Blob([plain], { type: "image/webp" }));
      } catch {
        // One unreadable picture should never take the whole list down —
        // the demands are the point, the picture is decoration.
      }
    }),
  );

  return out;
}

/** Fire-and-forget: a failed count must never block the page rendering. */
export function countView(id: string): void {
  void supabase.rpc("bump_wishlist_view", { p_id: id }).then(
    () => {},
    () => {},
  );
}
