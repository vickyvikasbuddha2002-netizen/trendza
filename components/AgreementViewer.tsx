"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signAgreement } from "@/lib/agreements";
import { recordVisit } from "@/lib/stats";
import type { Agreement } from "@/lib/types";
import { AgreementPaper } from "./AgreementPaper";
import { PageShell } from "./PageShell";
import { ShareBox } from "./ShareBox";
import { SignaturePad } from "./SignaturePad";
import { ThreadRule } from "./Ambient";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function AgreementViewer({ agreement }: { agreement: Agreement }) {
  const [signatureB, setSignatureB] = useState<string | null>(agreement.signatureB);
  const [draft, setDraft] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void recordVisit();
  }, []);

  const executed = Boolean(signatureB);

  const commit = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const accepted = await signAgreement(agreement.id, draft);
      if (!accepted) {
        // Someone signed it from another device or tab first. Their
        // signature stands; overwriting it would be wrong.
        setError("This has already been signed. Reload to see it.");
        return;
      }
      setSignatureB(draft);
      setSigning(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Could not save your signature. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell petals={9} seed={17}>
      <main className="mx-auto max-w-2xl px-5 pb-16 pt-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <p className="text-center font-sans text-[0.66rem] uppercase tracking-[0.38em] text-[var(--muted)]">
            {executed ? "Fully executed" : `${agreement.partyA} needs your signature`}
          </p>

          <div className="mt-6">
            <AgreementPaper
              partyA={agreement.partyA}
              partyB={agreement.partyB}
              clauses={agreement.clauses}
              signatureA={agreement.signatureA}
              signatureB={signatureB}
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Awaiting the counter-signature ──────────────────── */}
          {!executed && !signing && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mt-10 text-center"
            >
              <h1 className="font-display text-3xl font-light text-[var(--maroon)] sm:text-4xl">
                Do you accept these terms, {agreement.partyB}?
              </h1>
              <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-[var(--muted)]">
                Signing is permanent, in the sense that you will never hear the end of
                it.
              </p>
              <button
                type="button"
                onClick={() => setSigning(true)}
                className="mt-7 rounded-full bg-[var(--maroon)] px-9 py-4 font-sans text-sm tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
              >
                I accept — let me sign
              </button>
            </motion.div>
          )}

          {/* ── Signing ─────────────────────────────────────────── */}
          {!executed && signing && (
            <motion.div
              key="signing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mt-10"
            >
              <SignaturePad label={`${agreement.partyB}'s signature`} onChange={setDraft} />

              {error && (
                <p className="mt-5 rounded-xl bg-[var(--maroon)]/8 px-4 py-3 font-sans text-sm text-[var(--maroon)]">
                  {error}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSigning(false)}
                  className="rounded-full border border-[var(--ivory-shadow)] px-6 py-4 font-sans text-sm text-[var(--muted)] transition hover:border-[var(--gold)]"
                >
                  Wait
                </button>
                <button
                  type="button"
                  disabled={!draft || saving}
                  onClick={commit}
                  className="flex-1 rounded-full bg-[var(--maroon)] px-8 py-4 font-sans text-sm tracking-wide text-[var(--ivory)] transition enabled:hover:bg-[var(--maroon-soft)] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {saving ? "Sealing…" : "Make it official"}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Executed ────────────────────────────────────────── */}
          {executed && (
            <motion.div
              key="executed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mt-12 text-center"
            >
              <h1 className="font-display text-3xl font-light text-[var(--maroon)] sm:text-4xl">
                Binding for life.
              </h1>
              <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-[var(--muted)]">
                {agreement.partyA} and {agreement.partyB} have both signed. Screenshot
                it before someone changes their mind.
              </p>

              <div className="mx-auto mt-9 max-w-sm text-left">
                <ShareBox
                  path={`/a/${agreement.id}`}
                  shareText="It is signed. There is no going back 📜"
                  previewLabel="View it again"
                />
              </div>

              <div className="mx-auto mt-14 max-w-sm">
                <ThreadRule />
                <div className="mt-9 flex flex-col gap-3">
                  <Link
                    href="/create"
                    className="rounded-full bg-[var(--maroon)] px-7 py-3.5 font-sans text-[0.8rem] tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
                  >
                    Send them a rakhi wish →
                  </Link>
                  <Link
                    href="/shop"
                    className="rounded-full border border-[var(--gold)]/50 px-7 py-3.5 font-sans text-[0.8rem] tracking-wide text-[var(--maroon)] transition hover:bg-[var(--ivory-deep)]"
                  >
                    Browse rakhi gifts
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </PageShell>
  );
}
