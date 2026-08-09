/**
 * The clause library. Deliberately specific — "shall surrender the remote
 * on match days" lands, "shall be nice" does not. Written to be toggled
 * quickly on a phone, so each one fits on two lines.
 */
export interface ClauseGroup {
  label: string;
  clauses: string[];
}

export const CLAUSE_LIBRARY: ClauseGroup[] = [
  {
    label: "Household treaties",
    clauses: [
      "Party B shall surrender the TV remote on all match days, without sulking.",
      "The last slice of anything belongs to whoever calls it first, out loud, in front of a witness.",
      "Neither party shall report the other to Mummy for crimes older than one week.",
      "Party A retains permanent rights to the window seat on all journeys over one hour.",
      "Borrowed chargers shall be returned to their kingdom of origin within 24 hours.",
      "Whoever finishes the milk shall be the one who buys the milk. No exceptions, no appeals.",
    ],
  },
  {
    label: "Matters of honour",
    clauses: [
      "Party B shall never repeat the incident of 2014 at any family gathering.",
      "Embarrassing childhood photographs shall not be forwarded to anyone's future spouse.",
      "Both parties agree that the older sibling is older, and shall stop mentioning it.",
      "Neither party shall reveal the other's actual exam marks to visiting relatives.",
      "The nickname shall not be used in public, in writing, or in front of friends.",
    ],
  },
  {
    label: "Financial provisions",
    clauses: [
      "Party A shall provide emergency funds without interrogation, up to twice a month.",
      "All loans under ₹500 are hereby forgiven, retroactively and permanently.",
      "Rakhi gifts shall be of comparable value, judged in good faith by a neutral cousin.",
      "Party B agrees to pay for chai whenever Party A has genuinely forgotten their wallet.",
    ],
  },
  {
    label: "Lifelong obligations",
    clauses: [
      "Party A shall answer the phone at 2am, no matter what, and shall not complain about it.",
      "Both parties shall show up. For everything. Even the boring ones.",
      "Neither party shall become a stranger, regardless of distance, marriage, or time zones.",
      "Party B shall always take Party A's side in front of others, and argue with them privately.",
      "This bond renews automatically every year, and cannot be cancelled by either party.",
    ],
  },
];

/** Sensible starting selection so the page is never empty on arrival. */
export const DEFAULT_CLAUSES = [
  CLAUSE_LIBRARY[0].clauses[0],
  CLAUSE_LIBRARY[1].clauses[0],
  CLAUSE_LIBRARY[3].clauses[0],
];
