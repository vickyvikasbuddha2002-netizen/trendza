"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { forgetMade, getMade, type MadeThing } from "@/lib/local";

const LABEL: Record<MadeThing["kind"], string> = {
  wish: "Rakhi wish",
  wishlist: "Wishlist",
  agreement: "Sibling Accord",
};

/**
 * Everything you have made on this device, so a link is never lost.
 *
 * The ids are unguessable on purpose, which means there is no way to find a
 * wish again if the link goes — no account to log into, no email to search.
 * Closing the tab before sending it used to lose it permanently.
 *
 * Renders nothing at all on a device that has made nothing, so it never
 * clutters a first visit.
 */
export function YourLinks() {
  const [made, setMade] = useState<MadeThing[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => setMade(getMade()), []);

  if (made.length === 0) return null;

  const copy = async (path: string) => {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }
    setCopied(path);
    window.setTimeout(() => setCopied(null), 2000);
  };

  const remove = (path: string) => {
    forgetMade(path);
    setMade(getMade());
  };

  return (
    <section className="mx-auto mt-6 max-w-md">
      <h2 className="text-center font-sans text-[0.62rem] uppercase tracking-[0.32em] text-[var(--muted)]">
        Made on this device
      </h2>

      <ul className="mt-4 space-y-2">
        {made.map((thing) => (
          <li
            key={thing.path}
            className="flex items-center gap-3 rounded-2xl border border-[var(--ivory-shadow)] bg-[var(--ivory)]/60 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg text-[var(--maroon)]">
                {thing.to || "Untitled"}
              </p>
              <p className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-[var(--muted)]">
                {LABEL[thing.kind] ?? "Link"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => copy(thing.path)}
              aria-live="polite"
              className="shrink-0 rounded-full border border-[var(--gold)]/45 px-4 py-1.5 font-sans text-[0.68rem] text-[var(--maroon)] transition hover:bg-[var(--ivory-deep)]"
            >
              {copied === thing.path ? "Copied" : "Copy"}
            </button>

            <Link
              href={thing.path}
              className="shrink-0 font-sans text-[0.68rem] text-[var(--muted)] underline-offset-4 hover:text-[var(--maroon-soft)] hover:underline"
            >
              Open
            </Link>

            <button
              type="button"
              onClick={() => remove(thing.path)}
              aria-label={`Forget the link for ${thing.to}`}
              className="shrink-0 px-1 font-sans text-sm text-[var(--muted)] transition hover:text-[var(--maroon)]"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-center font-sans text-[0.62rem] leading-relaxed text-[var(--muted)]">
        Kept only in this browser. Clearing your history clears these.
      </p>
    </section>
  );
}
