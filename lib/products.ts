/**
 * The marketplace.
 *
 * These are the owner's own Amazon Associates links. The tracking tag is
 * already baked into each one — verified by following a link to its
 * destination and reading `tag=vikas242002-21` off the final Amazon URL — so
 * nothing here appends a tag. Doing so would risk breaking attribution rather
 * than improving it.
 *
 * No prices and no Amazon product images, deliberately. The associates
 * agreement requires both to come from Amazon's API and stay current, and API
 * access needs qualifying sales the account does not have yet. So the shop
 * persuades with the one thing that can be stated truthfully: whether a gift
 * still arrives before the day.
 *
 * Note on titles: Amazon product names are keyword soup ("Set of 2 Traditional
 * Floral Meenakari Rakhi with Roli Chawal, Red and Yellow Braided Thread
 * Crystal Stone Centerpiece Rakshabandhan..."). Printing those verbatim on an
 * ivory page would look worse than the short written descriptions used here.
 */

export interface Pick {
  /** Full affiliate URL, used exactly as provided. */
  url: string;
}

export interface Category {
  id: string;
  title: string;
  blurb: string;
  motif: "thread" | "sweets" | "hamper" | "silver" | "kids" | "card";
  /** Who this is aimed at, used for the filter chips. */
  audience: "everyone" | "her" | "him" | "kids";
  /** Realistic days from order to doorstep, for the honest delivery note. */
  shipDays: number;
  picks: Pick[];
}

const link = (url: string): Pick => ({ url });

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
  late: "Unlikely to arrive before the day",
};

/**
 * The catch-all. The tag is an account id, not a product id, so it works on
 * any Amazon URL including the front page — and anyone who leaves through it
 * starts the same 24-hour window as the curated links. Worth having, because
 * the person who cannot find their thing here would otherwise open Amazon in
 * a new tab and be worth nothing.
 */
export const AMAZON_HOME = `https://www.amazon.in/?tag=${encodeURIComponent(
  process.env.NEXT_PUBLIC_AMAZON_TAG || "vikas242002-21",
)}`;

export const CATEGORIES: Category[] = [
  {
    id: "rakhi-sets",
    title: "Rakhi sets",
    blurb:
      "Threads with roli and chawal in the box. The one thing the day genuinely does not work without, so it is the one to order first.",
    motif: "thread",
    audience: "everyone",
    shipDays: 3,
    picks: [
      link("https://link.amazon/B0hOVJrdC"),
      link("https://link.amazon/B0bPgeDj6"),
      link("https://link.amazon/B0etNMiGG"),
      link("https://link.amazon/B0e1fIwGL"),
      link("https://link.amazon/B09hAb38j"),
      link("https://link.amazon/B02eSRUEf"),
    ],
  },
  {
    id: "hampers",
    title: "Gift hampers",
    blurb:
      "Boxes that turn up already looking like an occasion. Nothing to wrap at your end, which matters when you are a thousand miles away.",
    motif: "hamper",
    audience: "everyone",
    shipDays: 4,
    picks: [
      link("https://link.amazon/B0bRonIOh"),
      link("https://link.amazon/B0iLdqVUh"),
      link("https://link.amazon/B055NoxC8"),
      link("https://link.amazon/B0hArVhGB"),
      link("https://link.amazon/B094PBbWG"),
    ],
  },
  {
    id: "sweets",
    title: "Sweets & dry fruits",
    blurb:
      "Kaju katli, mithai boxes, dry fruit trays. Nobody in the history of this festival has been disappointed to receive these.",
    motif: "sweets",
    audience: "everyone",
    shipDays: 3,
    picks: [
      link("https://link.amazon/B03mJzjgW"),
      link("https://link.amazon/B08ZXjBot"),
      link("https://link.amazon/B00t3wc5o"),
    ],
  },
  {
    id: "kids",
    title: "Kids' rakhis",
    blurb:
      "Cartoon and light-up rakhis for the small ones, who hold extremely firm opinions on this subject and will share them.",
    motif: "kids",
    audience: "kids",
    shipDays: 4,
    picks: [
      link("https://link.amazon/B08VcTz4m"),
      link("https://link.amazon/B08jMYgRG"),
    ],
  },
  {
    id: "electronics",
    title: "Electronics",
    blurb:
      "Earbuds, gadgets, the things they keep saying they will buy themselves and never do. The gift that gets used every single day.",
    motif: "card",
    audience: "everyone",
    shipDays: 4,
    picks: [
      link("https://link.amazon/B03MvHGoL"),
      link("https://link.amazon/B0dlcdel3"),
      link("https://link.amazon/B0jhMPoBx"),
      link("https://link.amazon/B0aGIdeRH"),
    ],
  },
  {
    id: "skincare-her",
    title: "Skincare for her",
    blurb:
      "The good stuff she looks at, puts back, and does not buy. Which is exactly why it works as a gift.",
    motif: "silver",
    audience: "her",
    shipDays: 4,
    picks: [
      link("https://link.amazon/B0eJnHD2J"),
      link("https://link.amazon/B09oPnY8K"),
    ],
  },
  {
    id: "skincare-him",
    title: "Grooming for him",
    blurb:
      "Because he is still using whatever was in the bathroom, and has been for some years now.",
    motif: "silver",
    audience: "him",
    shipDays: 4,
    picks: [
      link("https://link.amazon/B0iruFroF"),
      link("https://link.amazon/B04nslBd4"),
    ],
  },
  {
    id: "bags-her",
    title: "Bags & shoes for her",
    blurb:
      "Handbags, luggage, something to walk out of the house with. Sturdier than flowers and remembered a good deal longer.",
    motif: "hamper",
    audience: "her",
    shipDays: 5,
    picks: [
      link("https://link.amazon/B06xH7Qz6"),
      link("https://link.amazon/B00a5QZT8"),
      link("https://link.amazon/B05Eii2KH"),
    ],
  },
  {
    id: "bags-him",
    title: "Bags & shoes for him",
    blurb:
      "The backpack that is falling apart, replaced before he gets round to admitting it is falling apart.",
    motif: "hamper",
    audience: "him",
    shipDays: 5,
    picks: [
      link("https://link.amazon/B0ezPO6Gm"),
      link("https://link.amazon/B09qqZzdw"),
    ],
  },
  {
    id: "apparel",
    title: "Apparel & accessories",
    blurb:
      "Kurtas, watches, the things people wear to the actual celebration. Order these earliest — sizes are the first thing to run out.",
    motif: "card",
    audience: "everyone",
    shipDays: 5,
    picks: [
      link("https://link.amazon/B02E0VwxC"),
      link("https://link.amazon/B05Wm4FyW"),
      link("https://link.amazon/B09K5jWcu"),
    ],
  },
  {
    id: "misc",
    title: "Something else entirely",
    blurb:
      "For the sibling who is impossible to buy for, and knows it, and rather enjoys it.",
    motif: "silver",
    audience: "everyone",
    shipDays: 5,
    picks: [link("https://link.amazon/B0ezgEo4G")],
  },
];

export const TOTAL_PICKS = CATEGORIES.reduce((n, c) => n + c.picks.length, 0);
