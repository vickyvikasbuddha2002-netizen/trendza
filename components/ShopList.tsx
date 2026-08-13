"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ProductMotif } from "./ProductMotif";
import {
  AMAZON_HOME,
  CATEGORIES,
  TIMING_LABEL,
  TOTAL_PICKS,
  timingFor,
  type Category,
} from "@/lib/products";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Raksha Bandhan 2026 — Friday 28 August, IST. */
const RAKHI = new Date("2026-08-28T00:00:00+05:30");

/** Beyond this many, a category collapses behind a "+N more". */
const VISIBLE_PICKS = 8;

const AUDIENCES = [
  { id: "all", label: "Everything" },
  { id: "her", label: "For her" },
  { id: "him", label: "For him" },
  { id: "kids", label: "For kids" },
] as const;

type Audience = (typeof AUDIENCES)[number]["id"];

/**
 * Two decisions drive this list, in order: who it is for, then whether it can
 * still get there. The deadline is real and tightens on its own, which is the
 * only honest urgency available — prices cannot be shown without API access,
 * and inventing scarcity on a site built on sincerity would poison it.
 */
export function ShopList() {
  // Computed after mount: it depends on the reader's clock, and rendering it
  // on the server would guarantee a hydration mismatch.
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [audience, setAudience] = useState<Audience>("all");

  useEffect(() => {
    const compute = () =>
      setDaysLeft(Math.ceil((RAKHI.getTime() - Date.now()) / 86_400_000));
    compute();
    const timer = window.setInterval(compute, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const visible = CATEGORIES.filter(
    (c) => audience === "all" || c.audience === audience || c.audience === "everyone",
  );

  const ranked =
    daysLeft === null
      ? visible
      : [...visible].sort((a, b) => {
          const rank = { comfortable: 0, tight: 1, late: 2 } as const;
          return (
            rank[timingFor(a.shipDays, daysLeft)] - rank[timingFor(b.shipDays, daysLeft)] ||
            a.shipDays - b.shipDays
          );
        });

  return (
    <>
      {daysLeft !== null && (
        <motion.p
          className="mt-6 text-center font-sans text-[0.74rem] text-[var(--maroon)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {daysLeft > 0
            ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} to go — sorted by what still reaches them in time`
            : daysLeft === 0
              ? "Raksha Bandhan is today"
              : "Happy Raksha Bandhan"}
        </motion.p>
      )}

      {/* Who it is for. Cuts a long list down to the handful that apply. */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {AUDIENCES.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAudience(a.id)}
            aria-pressed={audience === a.id}
            className={`rounded-full border px-5 py-2 font-sans text-[0.75rem] tracking-wide transition ${
              audience === a.id
                ? "border-[var(--gold)] bg-[var(--ivory-deep)] text-[var(--maroon)]"
                : "border-[var(--ivory-shadow)] text-[var(--muted)] hover:border-[var(--gold)]/60"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-12 space-y-12">
        {ranked.map((category, i) => (
          <CategoryBlock
            key={category.id}
            category={category}
            daysLeft={daysLeft}
            index={i}
          />
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="font-sans text-[0.74rem] leading-relaxed text-[var(--muted)]">
          Not finding it? {TOTAL_PICKS} picks is never everything.
        </p>
        <a
          href={AMAZON_HOME}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-3 inline-block font-sans text-[0.8rem] text-[var(--maroon-soft)] underline-offset-4 hover:underline"
        >
          Browse all of Amazon →
        </a>
      </div>
    </>
  );
}

function CategoryBlock({
  category,
  daysLeft,
  index,
}: {
  category: Category;
  daysLeft: number | null;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const timing = daysLeft === null ? null : timingFor(category.shipDays, daysLeft);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: Math.min(index * 0.06, 0.4), ease: EASE }}
      className="flex gap-5"
    >
      <div className="shrink-0 pt-1">
        <ProductMotif motif={category.motif} />
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="font-display text-2xl font-light text-[var(--maroon)]">
          {category.title}
        </h2>
        <p className="mt-2 font-sans text-sm leading-relaxed text-[var(--muted)]">
          {category.blurb}
        </p>

        {timing && (
          <p
            className={`mt-2.5 font-sans text-[0.68rem] ${
              timing === "tight"
                ? "text-[var(--maroon)]"
                : timing === "late"
                  ? "text-[var(--muted)]/70"
                  : "text-[var(--muted)]"
            }`}
          >
            {timing === "tight" && "⚠ "}
            {TIMING_LABEL[timing]}
            <span className="text-[var(--muted)]/70"> · usually {category.shipDays} days</span>
          </p>
        )}

        {/* Each pick is its own link. Numbered rather than titled: Amazon's own
            product names are thirty words of keyword soup and would wreck the
            page, and inventing names for products I cannot see would be worse.

            Only the first eight show. Sixteen undifferentiated choices is the
            fastest way to make someone choose nothing at all. */}
        <div className="mt-4 flex flex-wrap gap-2">
          {category.picks.slice(0, expanded ? undefined : VISIBLE_PICKS).map((pick, i) => (
            <a
              key={pick.url}
              href={pick.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="rounded-full border border-[var(--gold)]/45 bg-[var(--ivory-deep)]/40 px-4 py-2 font-sans text-[0.74rem] text-[var(--maroon)] transition hover:border-[var(--gold)] hover:bg-[var(--ivory-deep)]"
            >
              {category.picks.length === 1 ? "See it on Amazon" : `Pick ${i + 1}`}
            </a>
          ))}

          {category.picks.length > VISIBLE_PICKS && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-full px-3 py-2 font-sans text-[0.74rem] text-[var(--muted)] underline-offset-4 transition hover:text-[var(--maroon)] hover:underline"
            >
              +{category.picks.length - VISIBLE_PICKS} more
            </button>
          )}
        </div>
      </div>
    </motion.section>
  );
}
