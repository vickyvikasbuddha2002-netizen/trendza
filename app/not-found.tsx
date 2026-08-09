import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell petals={6} seed={31}>
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <svg viewBox="0 0 120 60" className="w-32" fill="none" aria-hidden>
          <path
            d="M2 30h40M78 30h40"
            stroke="var(--gold)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M48 22l8 8-8 8M72 22l-8 8 8 8"
            stroke="var(--gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h1 className="mt-8 font-display text-4xl font-light text-[var(--maroon)] sm:text-5xl">
          This thread leads nowhere
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-[var(--muted)]">
          The link may have been mistyped, or the wish was never finished. Ask whoever
          sent it to share the link again.
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
