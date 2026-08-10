"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ThreadRule } from "./Ambient";
import { Countdown } from "./Countdown";
import { LiveCounters } from "./LiveCounters";
import { PageShell } from "./PageShell";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Landing() {
  return (
    <PageShell petals={12} seed={5}>
      <main className="mx-auto max-w-4xl px-6 pb-10 sm:px-8">
        {/* ── Hero ────────────────────────────────────────────── */}
        <section className="flex min-h-[78vh] flex-col items-center justify-center text-center">
          <motion.p
            className="font-sans text-[0.66rem] uppercase tracking-[0.4em] text-[var(--muted)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <Countdown />
          </motion.p>

          <RakhiMotif />

          <motion.h1
            className="mt-6 max-w-2xl font-display text-[2.9rem] font-light leading-[1.02] text-[var(--maroon)] sm:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
          >
            For the ones who are far away
          </motion.h1>

          <motion.p
            className="mt-7 max-w-lg font-display text-xl font-light italic leading-relaxed text-[var(--ink)] sm:text-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.75, ease: EASE }}
          >
            Some years the thread has to travel. Make one out of your
            photographs — the long summers, the old arguments, the things you
            have never quite managed to say — and let it arrive for you.
          </motion.p>

          <motion.p
            className="mt-5 font-sans text-[0.72rem] uppercase tracking-[0.28em] text-[var(--muted)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Free · No account · Ready in two minutes
          </motion.p>

          <motion.div
            className="mt-11 flex w-full max-w-sm flex-col gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.95, ease: EASE }}
          >
            <Link
              href="/create"
              className="rounded-full bg-[var(--maroon)] px-8 py-4 font-sans text-sm tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
            >
              Make a rakhi wish
            </Link>
            <Link
              href="/agreement"
              className="rounded-full border border-[var(--gold)]/50 bg-[var(--ivory-deep)]/40 px-8 py-4 font-sans text-sm tracking-wide text-[var(--maroon)] transition hover:border-[var(--gold)] hover:bg-[var(--ivory-deep)]/80"
            >
              Make a sibling agreement
            </Link>
          </motion.div>

          {/* The doubt people have before uploading family photographs, answered
              before they have to go looking for it. */}
          <motion.p
            className="mt-8 max-w-sm font-sans text-[0.72rem] leading-relaxed text-[var(--muted)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            Your photos are locked on your own phone before they are sent. We cannot
            open them, and they delete themselves.{" "}
            <Link
              href="/privacy"
              className="text-[var(--maroon-soft)] underline-offset-4 hover:underline"
            >
              How this works
            </Link>
          </motion.p>
        </section>

        {/* ── Live counters ───────────────────────────────────── */}
        <motion.section
          className="pb-6"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <ThreadRule />
          <div className="py-10">
            <LiveCounters />
          </div>
          <ThreadRule />
        </motion.section>

        {/* ── How it works ────────────────────────────────────── */}
        <section className="py-16">
          <h2 className="text-center font-display text-3xl font-light text-[var(--maroon)] sm:text-4xl">
            Three steps, about two minutes
          </h2>

          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Write it",
                d: "Their name, your name, and whatever you have never quite managed to say out loud.",
              },
              {
                n: "02",
                t: "Add the photos",
                d: "As many as you like. Add a note to any of them, or leave them to speak for themselves.",
              },
              {
                n: "03",
                t: "Send the link",
                d: "They open it and it unfolds — the thread unties, the photographs arrive one by one.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.85, delay: i * 0.12, ease: EASE }}
              >
                <div className="font-sans text-[0.62rem] tracking-[0.3em] text-[var(--gold)]">
                  {step.n}
                </div>
                <h3 className="mt-3 font-display text-2xl font-light text-[var(--maroon)]">
                  {step.t}
                </h3>
                <p className="mt-2.5 font-sans text-sm leading-relaxed text-[var(--muted)]">
                  {step.d}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── The accord ──────────────────────────────────────── */}
        <motion.section
          className="tz-paper relative overflow-hidden rounded-sm border border-[var(--ivory-shadow)] px-7 py-12 text-center sm:px-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.95, ease: EASE }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-3 border border-[var(--gold)]/25"
          />
          <div className="relative">
            <p className="font-type text-[0.6rem] uppercase tracking-[0.38em] text-[var(--muted)]">
              Entirely unofficial · Utterly binding
            </p>
            <h2 className="mt-4 font-display text-3xl font-normal uppercase tracking-[0.1em] text-[var(--maroon)] sm:text-4xl">
              The Sibling Accord
            </h2>
            <p className="mx-auto mt-5 max-w-md font-type text-sm leading-relaxed text-[var(--ink)]">
              Pick your terms — the remote on match days, the last slice, the incident
              of 2014 — sign it with your finger, and make them sign back.
            </p>
            <Link
              href="/agreement"
              className="mt-8 inline-block rounded-full border border-[var(--gold)]/55 px-7 py-3.5 font-sans text-[0.8rem] tracking-wide text-[var(--maroon)] transition hover:bg-[var(--ivory-deep)]"
            >
              Draw up the terms →
            </Link>
          </div>
        </motion.section>

        {/* ── Shop teaser ─────────────────────────────────────── */}
        <motion.section
          className="py-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <h2 className="font-display text-3xl font-light text-[var(--maroon)] sm:text-4xl">
            And something they can hold
          </h2>
          <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-[var(--muted)]">
            A wish arrives instantly. A rakhi still has to be posted — so it is worth
            doing now rather than on the day.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-block rounded-full border border-[var(--gold)]/50 px-7 py-3.5 font-sans text-[0.8rem] tracking-wide text-[var(--maroon)] transition hover:bg-[var(--ivory-deep)]"
          >
            Browse rakhi gifts →
          </Link>
        </motion.section>
      </main>
    </PageShell>
  );
}

/** A rakhi drawing itself: thread, then the flower, then the centre stone. */
function RakhiMotif() {
  return (
    <motion.svg
      viewBox="0 0 260 120"
      className="mt-8 w-56 sm:w-72"
      fill="none"
      initial="hidden"
      animate="shown"
    >
      <motion.path
        d="M0 60 H88"
        stroke="var(--gold)"
        strokeWidth="2"
        strokeLinecap="round"
        variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1 } }}
        transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
      />
      <motion.path
        d="M260 60 H172"
        stroke="var(--gold)"
        strokeWidth="2"
        strokeLinecap="round"
        variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1 } }}
        transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
      />

      {/* `transformBox: view-box` is doing real work here. Without it, CSS
          transform-origin on an SVG element resolves against that element's
          own bounding box, so every petal rotated around its own centre and
          the eight of them stacked into a clump above the stone instead of
          opening into a flower. */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.ellipse
          key={i}
          cx="130"
          cy="38"
          rx="9.5"
          ry="19"
          stroke="var(--gold)"
          strokeWidth="1.6"
          fill="var(--gold)"
          fillOpacity="0.08"
          variants={{
            hidden: { scale: 0, opacity: 0 },
            shown: { scale: 1, opacity: 1 },
          }}
          style={{
            transformBox: "view-box",
            transformOrigin: "130px 60px",
            rotate: i * 45,
          }}
          transition={{ duration: 0.7, delay: 0.75 + i * 0.06, ease: EASE }}
        />
      ))}

      <motion.circle
        cx="130"
        cy="60"
        r="13"
        fill="var(--maroon)"
        variants={{ hidden: { scale: 0 }, shown: { scale: 1 } }}
        style={{ transformOrigin: "130px 60px" }}
        transition={{ duration: 0.7, delay: 1.3, ease: EASE }}
      />
      <motion.circle
        cx="130"
        cy="60"
        r="19"
        stroke="var(--gold)"
        strokeWidth="1.4"
        variants={{ hidden: { scale: 0, opacity: 0 }, shown: { scale: 1, opacity: 1 } }}
        style={{ transformOrigin: "130px 60px" }}
        transition={{ duration: 0.8, delay: 1.45, ease: EASE }}
      />
    </motion.svg>
  );
}
