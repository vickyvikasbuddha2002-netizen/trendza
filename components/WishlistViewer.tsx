"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { PageShell } from "./PageShell";
import { ReactionCharacter } from "./ReactionCharacter";
import { ThreadRule } from "./Ambient";
import { countView, linkForWish, type Wishlist } from "@/lib/wishlist";
import { recordVisit } from "@/lib/stats";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function WishlistViewer({ list }: { list: Wishlist }) {
  useEffect(() => {
    void recordVisit();
    countView(list.id);
  }, [list.id]);

  const loopHref = `/wishlist?ref=${encodeURIComponent(list.id)}&from=${encodeURIComponent(list.from)}`;

  return (
    <PageShell petals={10} seed={83}>
      <main className="mx-auto max-w-2xl px-6 pb-16 sm:px-8">
        {/* Hero — full viewport, the name enormous. Never open on a list. */}
        <section className="flex min-h-[82vh] flex-col items-center justify-center text-center">
          <motion.p
            className="font-sans text-[0.68rem] uppercase tracking-[0.4em] text-[var(--muted)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            Yes, you
          </motion.p>

          <motion.h1
            className="mt-4 font-display text-[3.2rem] font-light leading-[0.95] text-[var(--maroon)] sm:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.35, ease: EASE }}
          >
            {list.to}
          </motion.h1>

          <motion.p
            className="mt-5 max-w-sm font-display text-xl font-light italic text-[var(--ink)] sm:text-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.6, ease: EASE }}
          >
            {list.from} has {list.wishes.length} demand
            {list.wishes.length === 1 ? "" : "s"} this Raksha Bandhan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8, ease: EASE }}
            className="mt-8"
          >
            <ReactionCharacter
              reaction={list.wishes[0]?.reaction ?? "request"}
              gender={list.fromGender}
              size={210}
            />
          </motion.div>

          <motion.span
            className="tz-float mt-10 font-sans text-[0.62rem] uppercase tracking-[0.34em] text-[var(--muted)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
          >
            scroll ↓
          </motion.span>
        </section>

        {/* The demands */}
        <div className="space-y-16">
          {list.wishes.map((wish, i) => {
            const gift = linkForWish(wish);
            return (
              <motion.section
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-[var(--gold)]">
                  Demand {i + 1} of {list.wishes.length}
                </p>

                <div className="mt-4 flex justify-center">
                  <ReactionCharacter
                    reaction={wish.reaction}
                    gender={list.fromGender}
                    size={168}
                  />
                </div>

                <p className="mx-auto mt-5 max-w-md font-display text-2xl font-light italic leading-relaxed text-[var(--maroon)] sm:text-3xl">
                  {wish.text}
                </p>

                {gift && (
                  <a
                    href={gift.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-6 inline-block rounded-full border border-[var(--gold)]/50 bg-[var(--ivory-deep)]/50 px-7 py-3 font-sans text-[0.78rem] tracking-wide text-[var(--maroon)] transition hover:border-[var(--gold)] hover:bg-[var(--ivory-deep)]"
                  >
                    Get this one →
                  </a>
                )}
              </motion.section>
            );
          })}
        </div>

        {/* Sign-off, then the loop. Land soft: a recipient who feels shaken
            down does not reply, and the reply is the entire product. */}
        <motion.section
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <p className="font-display text-2xl font-light italic text-[var(--maroon-soft)] sm:text-3xl">
            That is the whole list.
          </p>
          <p className="mt-2 font-display text-2xl font-light italic text-[var(--maroon)] sm:text-3xl">
            Not asking for much, honestly.
          </p>

          <div className="mx-auto mt-12 max-w-sm">
            <ThreadRule />
          </div>

          <p className="mt-10 font-display text-3xl font-light text-[var(--maroon)] sm:text-4xl">
            Your turn.
          </p>
          <p className="mx-auto mt-3 max-w-xs font-sans text-sm leading-relaxed text-[var(--muted)]">
            Make your own list and send it straight back to {list.from}.
          </p>

          {/* The largest button on the page, by some margin, and above the
              footer rather than below it. */}
          <Link
            href={loopHref}
            className="mt-7 block w-full rounded-full bg-[var(--maroon)] px-8 py-5 font-sans text-base tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
          >
            Make your list →
          </Link>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/shop"
              className="rounded-full border border-[var(--gold)]/50 px-7 py-3.5 font-sans text-[0.8rem] tracking-wide text-[var(--maroon)] transition hover:bg-[var(--ivory-deep)]"
            >
              Or just buy them something →
            </Link>
            <Link
              href="/create"
              className="font-sans text-[0.78rem] text-[var(--muted)] underline-offset-4 hover:text-[var(--maroon-soft)] hover:underline"
            >
              Send {list.from} a rakhi wish instead
            </Link>
          </div>
        </motion.section>
      </main>
    </PageShell>
  );
}
