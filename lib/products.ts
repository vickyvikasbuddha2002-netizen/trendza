/**
 * The marketplace.
 *
 * No prices and no Amazon product images anywhere in here, and that is not an
 * oversight. The Associates operating agreement requires both to come from
 * Amazon's API and to stay current; hand-typed prices or hotlinked product
 * photos are a terms violation that gets accounts closed. API access needs
 * qualifying sales first, which a site on its launch day does not have.
 *
 * So the persuasion runs on the one thing we can state truthfully: whether a
 * gift still arrives before the 28th. That is a real deadline, it tightens on
 * its own every day, and it does not require inventing anything.
 *
 * When the Creators API is available, add `asin` to an entry and the card
 * links straight to the product instead of a search. Price and image can be
 * layered in at that point without touching anything else.
 */
export interface Product {
  id: string;
  title: string;
  blurb: string;
  /** Fallback destination until a specific ASIN is available. */
  search: string;
  /** Set this to deep-link a specific product. Overrides `search`. */
  asin?: string;
  motif: "thread" | "sweets" | "hamper" | "silver" | "kids" | "card";
  forWhom: string;
  /** Realistic days from order to doorstep, used for the honest delivery note. */
  shipDays: number;
}

const TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "trendza-21";

export function amazonUrl(product: Product): string {
  const tag = encodeURIComponent(TAG);
  return product.asin
    ? `https://www.amazon.in/dp/${encodeURIComponent(product.asin)}?tag=${tag}`
    : `https://www.amazon.in/s?k=${encodeURIComponent(product.search)}&tag=${tag}`;
}

export type Timing = "comfortable" | "tight" | "late";

/** Honest, and it sharpens by itself as the day approaches. */
export function timingFor(shipDays: number, daysLeft: number): Timing {
  if (daysLeft < 0) return "late";
  if (daysLeft >= shipDays + 2) return "comfortable";
  if (daysLeft >= shipDays) return "tight";
  return "late";
}

export const TIMING_LABEL: Record<Timing, string> = {
  comfortable: "Arrives in good time",
  tight: "Cutting it fine — order today",
  late: "Will not arrive before the day",
};

export const PRODUCTS: Product[] = [
  {
    id: "rakhi-set",
    title: "Rakhi sets",
    blurb:
      "Single threads to full sets with roli, chawal and a box of mithai. The one thing the day genuinely does not work without.",
    search: "rakhi set for brother with roli chawal",
    motif: "thread",
    forWhom: "The one you actually tie",
    shipDays: 3,
  },
  {
    id: "sweets",
    title: "Sweets & dry fruits",
    blurb:
      "Kaju katli, soan papdi, mixed dry fruit trays. Nobody in the history of this festival has been disappointed to receive these.",
    search: "rakhi gift sweets kaju katli dry fruits box",
    motif: "sweets",
    forWhom: "When you cannot be at the table",
    shipDays: 3,
  },
  {
    id: "hamper",
    title: "Gift hampers",
    blurb:
      "Curated boxes that turn up already looking like an occasion — chocolates, a candle, a rakhi, a card. No wrapping required at your end.",
    search: "raksha bandhan gift hamper for sister",
    motif: "hamper",
    forWhom: "For sisters, from brothers",
    shipDays: 4,
  },
  {
    id: "silver",
    title: "Silver & keepsakes",
    blurb:
      "Coins, engraved pendants, photo frames. The sort of thing that is still in a drawer twenty years later, which is rather the point.",
    search: "silver rakhi gift coin pendant raksha bandhan",
    motif: "silver",
    forWhom: "For the milestone years",
    shipDays: 5,
  },
  {
    id: "kids",
    title: "Kids' rakhis",
    blurb:
      "Cartoon and light-up rakhis for the small ones, who have extremely firm opinions on this and will tell you about them.",
    search: "kids cartoon rakhi light up for children",
    motif: "kids",
    forWhom: "For the small terrors",
    shipDays: 4,
  },
  {
    id: "personalised",
    title: "Personalised gifts",
    blurb:
      "Printed mugs, photo cushions, engraved wallets. Pairs rather well with a wish made of the same photographs.",
    search: "personalised rakhi gift photo mug cushion engraved",
    motif: "card",
    forWhom: "To match the memories you just sent",
    shipDays: 7,
  },
];
