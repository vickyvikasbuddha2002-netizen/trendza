import { CHAI_URL } from "@/lib/site";

/**
 * Two sizes of the same ask.
 *
 * `quiet` sits in the footer of every page that has chrome. `warm` appears
 * once, on the screen right after someone has finished making something —
 * the only moment they are feeling good about the site rather than using it.
 *
 * Neither ever appears on /w/[id] or /a/[id]. Asking for money on top of
 * someone's heartfelt message would cheapen the thing entirely.
 */
export function ChaiLink({ variant = "quiet" }: { variant?: "quiet" | "warm" }) {
  if (variant === "quiet") {
    return (
      <a
        href={CHAI_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[var(--muted)] transition hover:text-[var(--maroon-soft)]"
      >
        <ChaiGlass className="h-3 w-3" />
        Buy me a chai
      </a>
    );
  }

  return (
    <a
      href={CHAI_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-2xl border border-[var(--gold)]/40 bg-[var(--ivory-deep)]/45 px-5 py-4 transition hover:border-[var(--gold)] hover:bg-[var(--ivory-deep)]/75"
    >
      <ChaiGlass className="h-8 w-8 shrink-0" />
      <span className="min-w-0">
        <span className="block font-display text-lg text-[var(--maroon)]">
          Buy me a chai
        </span>
        <span className="mt-0.5 block font-sans text-[0.7rem] leading-relaxed text-[var(--muted)]">
          Trendza is free and always will be. A chai keeps it running.
        </span>
      </span>
      <span
        aria-hidden
        className="ml-auto shrink-0 font-sans text-sm text-[var(--gold)] transition group-hover:translate-x-0.5"
      >
        →
      </span>
    </a>
  );
}

/** A cutting-chai glass, drawn rather than downloaded. */
function ChaiGlass({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="var(--gold)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6.5 9h11l-1.4 10.2a1.5 1.5 0 0 1-1.5 1.3H9.4a1.5 1.5 0 0 1-1.5-1.3z" />
      <path d="M8 12.5h8" opacity="0.5" />
      <path d="M9.5 5.6c0-1 1-1.4 1-2.4M12 5.6c0-1 1-1.4 1-2.4M14.5 5.6c0-1 1-1.4 1-2.4" opacity="0.7" />
    </svg>
  );
}
