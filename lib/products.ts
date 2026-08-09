/**
 * The marketplace.
 *
 * These are curated Amazon India *searches*, not hardcoded ASINs. That is
 * deliberate: a specific product id goes out of stock during the one week
 * of the year this site matters, and a dead link at the moment of purchase
 * intent is worse than no link. Searches never 404 and never sell out.
 *
 * Once your Associates account clears and you have the Product Advertising
 * API, swap `search` for `asin` on any entry and the card renders the same.
 */
export interface Product {
  id: string;
  title: string;
  blurb: string;
  search: string;
  /** Drawn as a gold line motif — no image download on a 4G connection. */
  motif: "thread" | "sweets" | "hamper" | "silver" | "kids" | "card";
  forWhom: string;
}

const TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "trendza-21";

export function amazonUrl(product: Product): string {
  const q = encodeURIComponent(product.search);
  return `https://www.amazon.in/s?k=${q}&tag=${encodeURIComponent(TAG)}`;
}

export const PRODUCTS: Product[] = [
  {
    id: "rakhi-set",
    title: "Rakhi sets",
    blurb:
      "Single threads to full sets with roli, chawal and a box of mithai included. The classic, and still the one that gets sent most.",
    search: "rakhi set for brother with roli chawal",
    motif: "thread",
    forWhom: "The one you actually tie",
  },
  {
    id: "sweets",
    title: "Sweets & dry fruits",
    blurb:
      "Kaju katli, soan papdi, mixed dry fruit trays. Ships fast and nobody has ever been disappointed to receive it.",
    search: "rakhi gift sweets kaju katli dry fruits box",
    motif: "sweets",
    forWhom: "When you cannot be at the table",
  },
  {
    id: "hamper",
    title: "Gift hampers",
    blurb:
      "Curated boxes that arrive looking like an occasion — chocolates, candles, a rakhi and a card, already wrapped.",
    search: "raksha bandhan gift hamper for sister",
    motif: "hamper",
    forWhom: "For sisters, from brothers",
  },
  {
    id: "silver",
    title: "Silver & keepsakes",
    blurb:
      "Silver coins, engraved pendants, photo frames. The kind of thing that is still in a drawer twenty years later.",
    search: "silver rakhi gift coin pendant raksha bandhan",
    motif: "silver",
    forWhom: "For the milestone years",
  },
  {
    id: "kids",
    title: "Kids' rakhis",
    blurb:
      "Cartoon and light-up rakhis for the little ones, who have strong opinions about this and will let you know.",
    search: "kids cartoon rakhi light up for children",
    motif: "kids",
    forWhom: "For the small terrors",
  },
  {
    id: "personalised",
    title: "Personalised gifts",
    blurb:
      "Printed mugs, photo cushions, engraved wallets. Pairs well with a wish full of the same photographs.",
    search: "personalised rakhi gift photo mug cushion engraved",
    motif: "card",
    forWhom: "To match the memories you just sent",
  },
];
