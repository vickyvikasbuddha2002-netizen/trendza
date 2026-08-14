"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AgreementPaper } from "@/components/AgreementPaper";
import { ChaiLink } from "@/components/ChaiLink";
import { PageShell } from "@/components/PageShell";
import { ShareBox } from "@/components/ShareBox";
import { SignaturePad } from "@/components/SignaturePad";
import { ThreadRule } from "@/components/Ambient";
import { createAgreement } from "@/lib/agreements";
import { CLAUSE_LIBRARY, DEFAULT_CLAUSES, fillClause } from "@/lib/clauses";
import { recordVisit } from "@/lib/stats";
import { clearDraft, loadDraft, rememberMade, saveDraft } from "@/lib/local";

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_CLAUSES = 10;

type Step = "terms" | "sign" | "sending" | "done";

export default function AgreementBuilder() {
  const [step, setStep] = useState<Step>("terms");
  const [partyA, setPartyA] = useState("");
  const [partyB, setPartyB] = useState("");
  const [selected, setSelected] = useState<string[]>(DEFAULT_CLAUSES);
  const [custom, setCustom] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    void recordVisit();
    // The signature is not restored: it is a drawing tied to the canvas that
    // made it, and a half-remembered one would be worse than drawing again.
    const draft = loadDraft<{ a: string; b: string; clauses: string[] }>("agreement");
    if (draft) {
      setPartyA(draft.a ?? "");
      setPartyB(draft.b ?? "");
      if (Array.isArray(draft.clauses) && draft.clauses.length) setSelected(draft.clauses);
    }
  }, []);

  useEffect(() => {
    if (!partyA && !partyB) return;
    const timer = window.setTimeout(
      () => saveDraft("agreement", { a: partyA, b: partyB, clauses: selected }),
      400,
    );
    return () => window.clearTimeout(timer);
  }, [partyA, partyB, selected]);

  const toggle = (clause: string) => {
    setSelected((prev) => {
      if (prev.includes(clause)) return prev.filter((c) => c !== clause);
      if (prev.length >= MAX_CLAUSES) {
        setError(`${MAX_CLAUSES} terms is plenty. Remove one first.`);
        return prev;
      }
      setError(null);
      return [...prev, clause];
    });
  };

  const addCustom = () => {
    const text = custom.trim();
    if (!text) return;
    if (selected.length >= MAX_CLAUSES) {
      setError(`${MAX_CLAUSES} terms is plenty. Remove one first.`);
      return;
    }
    if (selected.includes(text)) return;
    setSelected((prev) => [...prev, text]);
    setCustom("");
    setError(null);
  };

  const canSign = partyA.trim() && partyB.trim() && selected.length > 0;

  const submit = async () => {
    if (!signature) return;
    setStep("sending");
    setError(null);
    try {
      const created = await createAgreement({
        partyA,
        partyB,
        // Names are baked in before saving, so the document that arrives is
        // about two actual people rather than two placeholders.
        clauses: selected.map((c) => fillClause(c, partyA, partyB)),
        signatureA: signature,
      });
      setId(created);
      rememberMade({ kind: "agreement", path: `/a/${created}`, to: partyB.trim() });
      clearDraft("agreement");
      setStep("done");
    } catch (err) {
      console.error(err);
      setError("Could not save the agreement. Please try again.");
      setStep("sign");
    }
  };

  return (
    <PageShell petals={7} seed={11}>
      <main className="mx-auto max-w-2xl px-6 pb-16 pt-10 sm:px-8">
        <AnimatePresence mode="wait">
          {/* ── Terms ───────────────────────────────────────────── */}
          {step === "terms" && (
            <motion.section
              key="terms"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <p className="font-sans text-[0.66rem] uppercase tracking-[0.38em] text-[var(--muted)]">
                Entirely unofficial
              </p>
              <h1 className="mt-4 font-display text-4xl font-light leading-tight text-[var(--maroon)] sm:text-5xl">
                The Sibling Accord
              </h1>
              <p className="mt-3 font-sans text-sm leading-relaxed text-[var(--muted)]">
                Pick your terms, sign it, and send it over for them to sign back. It
                holds up in no court whatsoever.
              </p>

              <div className="mt-9 grid gap-5 sm:grid-cols-2">
                <NameField
                  id="party-a"
                  label="Your name"
                  value={partyA}
                  onChange={setPartyA}
                />
                <NameField
                  id="party-b"
                  label="Their name"
                  value={partyB}
                  onChange={setPartyB}
                />
              </div>

              <div className="mt-10 space-y-8">
                {CLAUSE_LIBRARY.map((group) => (
                  <div key={group.label}>
                    <h2 className="font-sans text-[0.66rem] uppercase tracking-[0.28em] text-[var(--maroon-soft)]">
                      {group.label}
                    </h2>
                    <div className="mt-3 space-y-2">
                      {group.clauses.map((clause) => {
                        const on = selected.includes(clause);
                        return (
                          <button
                            key={clause}
                            type="button"
                            onClick={() => toggle(clause)}
                            aria-pressed={on}
                            className={`flex w-full gap-3 rounded-xl border px-4 py-3 text-left font-type text-[0.82rem] leading-relaxed transition ${
                              on
                                ? "border-[var(--gold)] bg-[var(--ivory-deep)]/70 text-[var(--ink)]"
                                : "border-[var(--ivory-shadow)] bg-[var(--ivory)]/50 text-[var(--muted)] hover:border-[var(--gold)]/55"
                            }`}
                          >
                            <span
                              aria-hidden
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border text-[0.6rem] ${
                                on
                                  ? "border-[var(--gold)] bg-[var(--gold)] text-white"
                                  : "border-[var(--muted)]/45"
                              }`}
                            >
                              {on ? "✓" : ""}
                            </span>
                            {fillClause(clause, partyA, partyB)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-9">
                <label className="font-sans text-[0.66rem] uppercase tracking-[0.28em] text-[var(--maroon-soft)]">
                  Write your own
                </label>
                <div className="mt-3 flex gap-2">
                  <input
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustom();
                      }
                    }}
                    maxLength={160}
                    placeholder={`${partyB.trim() || "They"} shall stop telling that story.`}
                    className="min-w-0 flex-1 rounded-full border border-[var(--ivory-shadow)] bg-[var(--ivory)]/70 px-5 py-3 font-type text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)]/55 focus:border-[var(--gold)]"
                  />
                  <button
                    type="button"
                    onClick={addCustom}
                    className="shrink-0 rounded-full border border-[var(--gold)]/50 px-5 py-3 font-sans text-xs text-[var(--maroon)] transition hover:bg-[var(--ivory-deep)]"
                  >
                    Add
                  </button>
                </div>
              </div>

              {error && (
                <p className="mt-5 rounded-xl bg-[var(--maroon)]/8 px-4 py-3 font-sans text-sm text-[var(--maroon)]">
                  {error}
                </p>
              )}

              <button
                type="button"
                disabled={!canSign}
                onClick={() => setStep("sign")}
                className="mt-9 w-full rounded-full bg-[var(--maroon)] px-8 py-4 font-sans text-sm tracking-wide text-[var(--ivory)] transition enabled:hover:bg-[var(--maroon-soft)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                {selected.length} term{selected.length === 1 ? "" : "s"} · Sign it →
              </button>
            </motion.section>
          )}

          {/* ── Sign ────────────────────────────────────────────── */}
          {step === "sign" && (
            <motion.section
              key="sign"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <h1 className="font-display text-4xl font-light leading-tight text-[var(--maroon)] sm:text-5xl">
                Sign it, {partyA.trim()}.
              </h1>
              <p className="mt-3 font-sans text-sm text-[var(--muted)]">
                Then send it to {partyB.trim()} for their signature.
              </p>

              <div className="mt-8">
                <SignaturePad label="Your signature" onChange={setSignature} />
              </div>

              <div className="mt-10">
                <AgreementPaper
                  partyA={partyA}
                  partyB={partyB}
                  clauses={selected.map((c) => fillClause(c, partyA, partyB))}
                  signatureA={signature}
                  animate={false}
                />
              </div>

              {error && (
                <p className="mt-5 rounded-xl bg-[var(--maroon)]/8 px-4 py-3 font-sans text-sm text-[var(--maroon)]">
                  {error}
                </p>
              )}

              <div className="mt-9 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("terms")}
                  className="rounded-full border border-[var(--ivory-shadow)] px-6 py-4 font-sans text-sm text-[var(--muted)] transition hover:border-[var(--gold)] hover:text-[var(--maroon)]"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!signature}
                  onClick={submit}
                  className="flex-1 rounded-full bg-[var(--maroon)] px-8 py-4 font-sans text-sm tracking-wide text-[var(--ivory)] transition enabled:hover:bg-[var(--maroon-soft)] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {signature ? "Seal and get the link" : "Sign above to continue"}
                </button>
              </div>
            </motion.section>
          )}

          {step === "sending" && (
            <motion.section
              key="sending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[60vh] items-center justify-center"
            >
              <p className="tz-breathe font-display text-2xl font-light italic text-[var(--maroon)]">
                Pressing the seal…
              </p>
            </motion.section>
          )}

          {/* ── Done ────────────────────────────────────────────── */}
          {step === "done" && id && (
            <motion.section
              key="done"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <h1 className="font-display text-4xl font-light leading-tight text-[var(--maroon)] sm:text-5xl">
                Signed and sealed.
              </h1>
              <p className="mt-3 font-sans text-sm text-[var(--muted)]">
                Send it to {partyB.trim()}. It is not finished until they sign back.
              </p>

              <ShareBox
                path={`/a/${id}`}
                shareText={`${partyB.trim()}, I need your signature on this 📜`}
                previewLabel="See the document"
              />

              <div className="mt-14">
                <ThreadRule />
              </div>

              <div className="mt-10 flex flex-col gap-3">
                <Link
                  href="/create"
                  className="rounded-full bg-[var(--maroon)] px-7 py-3.5 text-center font-sans text-[0.8rem] tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
                >
                  Now make them a rakhi wish →
                </Link>
                <Link
                  href="/shop"
                  className="rounded-full border border-[var(--gold)]/50 px-7 py-3.5 text-center font-sans text-[0.8rem] tracking-wide text-[var(--maroon)] transition hover:bg-[var(--ivory-deep)]"
                >
                  Browse rakhi gifts
                </Link>
              </div>

              <div className="mt-12">
                <ChaiLink variant="warm" />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </PageShell>
  );
}

function NameField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-sans text-[0.68rem] uppercase tracking-[0.26em] text-[var(--muted)]"
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={40}
        className="mt-2 w-full rounded-full border border-[var(--ivory-shadow)] bg-[var(--ivory)]/70 px-5 py-3.5 font-display text-lg text-[var(--ink)] outline-none transition focus:border-[var(--gold)]"
      />
    </div>
  );
}
