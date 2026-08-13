import { supabase } from "./supabase";
import { newId } from "./id";
import { CATEGORIES } from "./products";

export type Reaction = "request" | "beg" | "mercy" | "threat" | "show" | "celebrate";

export const REACTIONS: { id: Reaction; label: string }[] = [
  { id: "request", label: "Politely asking" },
  { id: "beg", label: "Begging" },
  { id: "mercy", label: "Mercy eyes" },
  { id: "threat", label: "Threatening" },
  { id: "show", label: "Showing off" },
  { id: "celebrate", label: "Celebrating" },
];

/**
 * The default escalates as the list grows, so someone who never opens the
 * picker still ends up with an arc rather than six identical faces.
 */
export function defaultReaction(index: number): Reaction {
  return (["request", "request", "beg", "mercy", "threat", "threat"] as const)[
    Math.min(index, 5)
  ];
}

export interface WishItem {
  reaction: Reaction;
  /** Max 60 characters. Free text, because the funniest ones have no product. */
  text: string;
  /** Category id from the affiliate catalogue, when picked from the shop. */
  categoryId?: string;
  /** Index of the pick within that category. */
  pickIndex?: number;
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

export async function createWishlist(input: {
  from: string;
  to: string;
  fromGender: "f" | "m";
  wishes: WishItem[];
  parentId?: string | null;
}): Promise<string> {
  const id = newId();

  const { error } = await supabase.from("wishlists").insert({
    id,
    from_name: input.from.trim().slice(0, 20),
    to_name: input.to.trim().slice(0, 20),
    from_gender: input.fromGender,
    wishes: input.wishes
      .map((w) => ({ ...w, text: w.text.trim().slice(0, MAX_WISH_CHARS) }))
      .filter((w) => w.text.length > 0)
      .slice(0, MAX_WISHES),
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

  return id;
}

/** Fire-and-forget: a failed count must never block the page rendering. */
export function countView(id: string): void {
  void supabase.rpc("bump_wishlist_view", { p_id: id }).then(
    () => {},
    () => {},
  );
}
