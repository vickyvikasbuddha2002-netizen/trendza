"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ProductMotif } from "./ProductMotif";
import { PRODUCTS, TIMING_LABEL, amazonUrl, timingFor } from "@/lib/products";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Raksha Bandhan 2026 — Friday 28 August, IST. */
const RAKHI = new Date("2026-08-28T00:00:00+05:30");

/**
 * Orders the list by what can still get there in time, and says so plainly.
 *
 * This is the only lever available — prices and stock cannot be shown without
 * API access — and it happens to be the more honest one. The deadline is real,
 * it tightens on its own, and nothing here has to be invented to make it bite.
 */
export function ShopList() {
  // Computed after mount: it depends on the reader's clock, and rendering it
  // on the server would guarantee a hydration mismatch.
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const compute = () =>
      setDaysLeft(Math.ceil((RAKHI.getTime() - Date.now()) / 86_400_000));
    compute();
    const timer = window.setInterval(compute, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const ranked =
    daysLeft === null
      ? PRODUCTS
      : [...PRODUCTS].sort((a, b) => {
          const rank = { comfortable: 0, tight: 1, late: 2 } as const;
          const ta = rank[timingFor(a.shipDays, daysLeft)];
          const tb = rank[timingFor(b.shipDays, daysLeft)];
          return ta - tb || a.shipDays - b.shipDays;
        });

  return (
    <>
      {daysLeft !== null && daysLeft >= 0 && (
        <motion.p
          className="mt-6 text-center font-sans text-[0.72rem] text-[var(--maroon)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {daysLeft === 0
            ? "Raksha Bandhan is today. Only what is already in the house will do."
            : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left. Sorted by what still reaches them in time.`}
        </motion.p>
      )}

      <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2">
        {ranked.map((product, i) => {
          const timing = daysLeft === null ? null : timingFor(product.shipDays, daysLeft);
          return (
            <motion.a
              key={product.id}
              href={amazonUrl(product)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group flex gap-5"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: EASE }}
            >
              <div className="shrink-0 pt-1">
                <ProductMotif motif={product.motif} />
              </div>
              <div className="min-w-0">
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.24em] text-[var(--gold)]">
                  {product.forWhom}
                </p>
                <h2 className="mt-1.5 font-display text-2xl font-light text-[var(--maroon)] transition group-hover:text-[var(--maroon-soft)]">
                  {product.title}
                </h2>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[var(--muted)]">
                  {product.blurb}
                </p>

                {timing && (
                  <p
                    className={`mt-3 font-sans text-[0.68rem] ${
                      timing === "tight"
                        ? "text-[var(--maroon)]"
                        : timing === "late"
                          ? "text-[var(--muted)]/70"
                          : "text-[var(--muted)]"
                    }`}
                  >
                    {timing === "tight" && "⚠ "}
                    {TIMING_LABEL[timing]}
                    <span className="text-[var(--muted)]/70">
                      {" "}
                      · usually {product.shipDays} days
                    </span>
                  </p>
                )}

                <span className="mt-3 inline-block font-sans text-[0.76rem] tracking-wide text-[var(--maroon-soft)] underline-offset-4 group-hover:underline">
                  See them on Amazon →
                </span>
              </div>
            </motion.a>
          );
        })}
      </div>
    </>
  );
}
