/**
 * The clause library.
 *
 * `{A}` is whoever is drawing it up, `{B}` is the sibling they are sending it
 * to, and both are replaced with real names before the agreement is saved.
 * "Party B shall surrender the TV remote" is a form; "Ananya shall surrender
 * the TV remote" is a joke about an actual person, which is the entire point.
 */
export interface ClauseGroup {
  label: string;
  clauses: string[];
}

/** Names are substituted in the builder as they are typed, and again on save. */
export function fillClause(template: string, a: string, b: string): string {
  return template
    .replaceAll("{A}", a.trim() || "You")
    .replaceAll("{B}", b.trim() || "They");
}

export const CLAUSE_LIBRARY: ClauseGroup[] = [
  {
    label: "Household treaties",
    clauses: [
      "{B} shall surrender the TV remote on all match days, without sulking.",
      "The last slice of anything belongs to whoever calls it first, out loud, in front of a witness.",
      "Neither {A} nor {B} shall report the other to Mummy for crimes older than one week.",
      "{A} keeps permanent rights to the window seat on every journey over one hour.",
      "Borrowed chargers shall be returned to their kingdom of origin within 24 hours.",
      "Whoever finishes the milk shall be the one who buys the milk. No exceptions, no appeals.",
    ],
  },
  {
    label: "Matters of honour",
    clauses: [
      "{B} shall never bring up the incident of 2014 at a family gathering again.",
      "Embarrassing childhood photographs shall not be forwarded to anyone's future spouse.",
      "{A} and {B} agree that the older one is older, and shall now stop mentioning it.",
      "Neither shall reveal the other's actual exam marks to visiting relatives.",
      "The nickname shall not be used in public, in writing, or in front of friends.",
    ],
  },
  {
    label: "Financial provisions",
    clauses: [
      "{A} shall provide emergency funds without interrogation, up to twice a month.",
      "All loans under ₹500 are hereby forgiven, retroactively and permanently.",
      "Rakhi gifts shall be of comparable value, judged in good faith by a neutral cousin.",
      "{B} agrees to pay for chai whenever {A} has genuinely forgotten their wallet.",
    ],
  },
  {
    label: "Lifelong obligations",
    clauses: [
      "{A} shall answer the phone at 2am, no matter what, and shall not complain about it.",
      "{A} and {B} shall show up. For everything. Even the boring ones.",
      "Neither shall become a stranger, regardless of distance, marriage, or time zones.",
      "{B} shall always take {A}'s side in front of others, and argue with them privately.",
      "This bond renews automatically every year, and cannot be cancelled by either of them.",
    ],
  },
];

/** Sensible starting selection so the page is never empty on arrival. */
export const DEFAULT_CLAUSES = [
  CLAUSE_LIBRARY[0].clauses[0],
  CLAUSE_LIBRARY[1].clauses[0],
  CLAUSE_LIBRARY[3].clauses[0],
];
