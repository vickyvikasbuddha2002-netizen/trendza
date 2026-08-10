/**
 * The closing lines, one pair per wish.
 *
 * Chosen from the wish's own id rather than at random on each render. Two
 * reasons: a value that changes between server and client render would throw
 * a hydration mismatch, and a recipient who reopens the link should find the
 * same words they read the first time. Every wish still gets its own.
 */
export interface Blessing {
  first: string;
  second: string;
}

export const BLESSINGS: Blessing[] = [
  { first: "Distance is only distance.", second: "The thread holds anyway." },
  { first: "Some years we cannot be in the same room.", second: "We are never in different ones." },
  { first: "The thread is thin and the knot is small.", second: "Neither has ever come undone." },
  { first: "Cities change. Houses change.", second: "You are still the one who knows." },
  { first: "There will be more summers.", second: "There will be more photographs." },
  { first: "You were the first person who was mine.", second: "You are still the easiest to find." },
  { first: "A thread does not hold because it is strong.", second: "It holds because someone tied it." },
  { first: "Everyone else arrives and leaves.", second: "You were simply always here." },
  { first: "We have been through worse than a bad year.", second: "We have the photographs to prove it." },
  { first: "The miles do the travelling.", second: "The rest of it stays exactly where it was." },
  { first: "One day we will be old and impossible.", second: "Still ringing each other about nothing." },
  { first: "It was never about the rakhi.", second: "It was about who ties it." },
];

/** Stable hash of the id, so the same wish always closes the same way. */
export function blessingFor(id: string): Blessing {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return BLESSINGS[hash % BLESSINGS.length];
}
