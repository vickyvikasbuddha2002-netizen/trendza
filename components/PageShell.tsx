import Link from "next/link";
import type { ReactNode } from "react";
import { Bloom, Petals } from "./Ambient";
import { ChaiLink } from "./ChaiLink";

/**
 * Chrome for the non-immersive pages. The wish and agreement viewers
 * deliberately do not use this — they own the whole viewport.
 */
export function PageShell({
  children,
  petals = 10,
  seed = 3,
}: {
  children: ReactNode;
  petals?: number;
  seed?: number;
}) {
  return (
    <div className="relative min-h-dvh bg-[var(--ivory)]">
      <Bloom />
      <Petals count={petals} seed={seed} />

      <header className="relative z-30 px-6 pt-7 sm:px-10">
        <Link
          href="/"
          className="font-display text-xl tracking-wide text-[var(--maroon)] transition hover:text-[var(--maroon-soft)]"
        >
          Trendza
        </Link>
      </header>

      <div className="relative z-30">{children}</div>

      <footer className="relative z-30 px-6 pb-10 pt-20 text-center sm:px-10">
        <p className="font-sans text-[0.66rem] leading-relaxed text-[var(--muted)]">
          Trendza is an Amazon Associate and earns from qualifying purchases.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-sans text-[0.66rem] text-[var(--muted)]">
          <Link href="/create" className="hover:text-[var(--maroon-soft)]">
            Make a wish
          </Link>
          <Link href="/agreement" className="hover:text-[var(--maroon-soft)]">
            Sibling agreement
          </Link>
          <Link href="/shop" className="hover:text-[var(--maroon-soft)]">
            Rakhi gifts
          </Link>
          <Link href="/privacy" className="hover:text-[var(--maroon-soft)]">
            Your photos
          </Link>
          <Link href="/terms" className="hover:text-[var(--maroon-soft)]">
            Terms
          </Link>
          <ChaiLink />
        </div>
      </footer>
    </div>
  );
}
