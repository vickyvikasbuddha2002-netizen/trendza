import Link from "next/link";
import { PageShell } from "./PageShell";

/**
 * The three ways a wish can fail to open. Each one gets a plain explanation
 * of what happened and what to do about it — a broken page with missing
 * images would leave the reader assuming the sender did something wrong.
 */
export function WishUnavailable({
  variant,
  to,
  from,
}: {
  variant: "expired" | "no-key" | "undecryptable";
  to?: string;
  from?: string;
}) {
  const copy = {
    expired: {
      title: "This wish has expired",
      body:
        from && to
          ? `${from} chose for this to be temporary, and the time is up. The photographs have been deleted and cannot be recovered — not by us either. Ask ${from} to send a new one.`
          : "The sender chose for this to be temporary, and the time is up. The photographs have been deleted and cannot be recovered.",
    },
    "no-key": {
      title: "This link is incomplete",
      body:
        "The part of the link after the # is missing, and that part is the key that unlocks the photographs. Some apps cut long links short. Ask whoever sent it to share the full link again — copying it rather than retyping it.",
    },
    undecryptable: {
      title: "This wish could not be unlocked",
      body:
        "The key in this link does not match this wish. The link may have been altered or joined together from two messages. Ask the sender to share it again.",
    },
  }[variant];

  return (
    <PageShell petals={5} seed={41}>
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <svg viewBox="0 0 120 70" className="w-32" fill="none" aria-hidden>
          <path
            d="M4 35h34M82 35h34"
            stroke="var(--gold)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.45"
          />
          <path
            d="M46 28c0-6 4-10 8-10s8 4 8 10"
            stroke="var(--gold)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <rect
            x="42"
            y="28"
            width="26"
            height="20"
            rx="3"
            stroke="var(--gold)"
            strokeWidth="1.8"
          />
        </svg>

        <h1 className="mt-8 font-display text-4xl font-light leading-tight text-[var(--maroon)] sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-[var(--muted)]">
          {copy.body}
        </p>

        <div className="mt-9 flex flex-col gap-3">
          <Link
            href="/create"
            className="rounded-full bg-[var(--maroon)] px-8 py-3.5 font-sans text-sm tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
          >
            Make a wish of your own
          </Link>
          <Link
            href="/"
            className="font-sans text-sm text-[var(--muted)] underline-offset-4 hover:text-[var(--maroon-soft)] hover:underline"
          >
            Back to the beginning
          </Link>
        </div>
      </main>
    </PageShell>
  );
}
