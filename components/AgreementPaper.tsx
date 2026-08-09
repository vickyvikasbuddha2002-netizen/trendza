"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The document itself. Shared between the builder preview and the viewer so
 * what the sender sees while composing is exactly what arrives.
 *
 * Framed as a keepsake throughout — no wording anywhere implies this is a
 * real contract, because it is a joke between siblings and should read as one.
 */
export function AgreementPaper({
  partyA,
  partyB,
  clauses,
  signatureA,
  signatureB,
  footer,
  animate = true,
}: {
  partyA: string;
  partyB: string;
  clauses: string[];
  signatureA?: string | null;
  signatureB?: string | null;
  footer?: ReactNode;
  animate?: boolean;
}) {
  const reveal = animate
    ? {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-6%" },
      }
    : {};

  return (
    <div className="tz-paper relative overflow-hidden rounded-sm border border-[var(--ivory-shadow)] px-6 py-10 shadow-[0_18px_50px_rgba(110,27,36,0.09)] sm:px-12 sm:py-14">
      {/* Ornamental double rule */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 border border-[var(--gold)]/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[0.9rem] border border-[var(--gold)]/15"
      />

      <div className="relative">
        <motion.p
          {...reveal}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-center font-type text-[0.6rem] uppercase tracking-[0.4em] text-[var(--muted)]"
        >
          Entirely unofficial · Utterly binding
        </motion.p>

        <motion.h2
          {...reveal}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="mt-5 text-center font-display text-3xl font-normal uppercase tracking-[0.14em] text-[var(--maroon)] sm:text-4xl"
        >
          The Sibling Accord
        </motion.h2>

        <motion.div
          {...reveal}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mx-auto mt-5 flex max-w-xs items-center gap-2"
        >
          <div className="h-px flex-1 bg-[var(--gold)]/45" />
          <div className="h-1.5 w-1.5 rotate-45 bg-[var(--gold)]" />
          <div className="h-px flex-1 bg-[var(--gold)]/45" />
        </motion.div>

        <motion.p
          {...reveal}
          transition={{ duration: 0.9, delay: 0.28, ease: EASE }}
          className="mt-8 text-center font-type text-[0.82rem] leading-loose text-[var(--ink)]"
        >
          Made this day between{" "}
          <span className="font-semibold text-[var(--maroon)]">
            {partyA || "________"}
          </span>{" "}
          <span className="text-[var(--muted)]">(hereafter “Party A”)</span> and{" "}
          <span className="font-semibold text-[var(--maroon)]">
            {partyB || "________"}
          </span>{" "}
          <span className="text-[var(--muted)]">(hereafter “Party B”)</span>, who are
          stuck with each other for life.
        </motion.p>

        <ol className="mt-9 space-y-5">
          {clauses.map((clause, i) => (
            <motion.li
              key={clause}
              {...reveal}
              transition={{ duration: 0.75, delay: 0.35 + i * 0.07, ease: EASE }}
              className="flex gap-4 font-type text-[0.86rem] leading-relaxed text-[var(--ink)]"
            >
              <span className="shrink-0 text-[var(--gold)]">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <span>{clause}</span>
            </motion.li>
          ))}
          {clauses.length === 0 && (
            <li className="text-center font-type text-sm text-[var(--muted)]">
              No terms agreed yet.
            </li>
          )}
        </ol>

        <div className="mt-12 grid grid-cols-2 gap-6">
          <SignatureSlot name={partyA} role="Party A" signature={signatureA} />
          <SignatureSlot name={partyB} role="Party B" signature={signatureB} />
        </div>

        {footer && <div className="mt-10">{footer}</div>}
      </div>
    </div>
  );
}

function SignatureSlot({
  name,
  role,
  signature,
}: {
  name: string;
  role: string;
  signature?: string | null;
}) {
  return (
    <div className="text-center">
      <div className="flex h-20 items-end justify-center">
        {signature ? (
          <motion.img
            src={signature}
            alt={`${name}'s signature`}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-h-20 w-auto max-w-full object-contain mix-blend-multiply"
          />
        ) : (
          <span className="pb-2 font-type text-[0.68rem] italic text-[var(--muted)]/70">
            awaiting signature
          </span>
        )}
      </div>
      <div className="mt-1 border-t border-[var(--ink)]/35 pt-2">
        <p className="font-type text-[0.8rem] text-[var(--ink)]">{name || "________"}</p>
        <p className="font-sans text-[0.58rem] uppercase tracking-[0.24em] text-[var(--muted)]">
          {role}
        </p>
      </div>
    </div>
  );
}
