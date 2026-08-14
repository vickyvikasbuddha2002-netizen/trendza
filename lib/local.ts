/**
 * Small localStorage helpers: drafts, and a record of what you have made.
 *
 * Two real losses this prevents. Someone writes a message they have been
 * working up to for years, switches apps to find a photograph, and comes back
 * to an empty form. And someone creates a wish, closes the tab before sending
 * it, and has no way back — the link is unguessable by design, so losing it
 * loses the thing forever.
 *
 * Everything here fails silently. Private browsing and blocked storage must
 * cost a convenience, never the page.
 */

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode */
  }
}

// ── Drafts ────────────────────────────────────────────────────────

const DRAFT_TTL = 1000 * 60 * 60 * 24 * 3; // three days

interface Draft<T> {
  at: number;
  data: T;
}

export function saveDraft<T>(name: string, data: T): void {
  write(`tz_draft_${name}`, { at: Date.now(), data } satisfies Draft<T>);
}

export function loadDraft<T>(name: string): T | null {
  const draft = read<Draft<T>>(`tz_draft_${name}`);
  if (!draft) return null;
  // An old draft is more confusing than helpful — nobody expects a form to
  // still be holding last week's half-finished message.
  if (Date.now() - draft.at > DRAFT_TTL) {
    clearDraft(name);
    return null;
  }
  return draft.data;
}

export function clearDraft(name: string): void {
  try {
    localStorage.removeItem(`tz_draft_${name}`);
  } catch {
    /* nothing to do */
  }
}

// ── Things you have made ──────────────────────────────────────────

export type MadeKind = "wish" | "wishlist" | "agreement";

export interface MadeThing {
  kind: MadeKind;
  /** Full path including any #key — without it the link is useless. */
  path: string;
  /** Who it was for, so a list of three is still tellable apart. */
  to: string;
  at: number;
}

const MADE_KEY = "tz_made";
const MADE_LIMIT = 12;

export function rememberMade(thing: Omit<MadeThing, "at">): void {
  const all = read<MadeThing[]>(MADE_KEY) ?? [];
  const next = [{ ...thing, at: Date.now() }, ...all.filter((m) => m.path !== thing.path)];
  write(MADE_KEY, next.slice(0, MADE_LIMIT));
}

export function getMade(): MadeThing[] {
  const all = read<MadeThing[]>(MADE_KEY);
  if (!Array.isArray(all)) return [];
  return all.filter((m) => m && typeof m.path === "string");
}

export function forgetMade(path: string): void {
  write(MADE_KEY, getMade().filter((m) => m.path !== path));
}
