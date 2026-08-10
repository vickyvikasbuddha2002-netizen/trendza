"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { ThreadRule } from "@/components/Ambient";
import { ChaiLink } from "@/components/ChaiLink";
import { ShareBox } from "@/components/ShareBox";
import { createWish, type DraftPhoto } from "@/lib/wishes";
import { recordVisit } from "@/lib/stats";
import type { Retention } from "@/lib/types";

const MAX_PHOTOS = 12;
const EASE = [0.22, 1, 0.36, 1] as const;

const RETENTION_CHOICES: { value: Retention; label: string; note: string }[] = [
  { value: "24h", label: "24 hours", note: "Gone by tomorrow" },
  { value: "7d", label: "7 days", note: "Lasts the festival" },
  { value: "30d", label: "30 days", note: "Time to come back to it" },
  { value: "forever", label: "Forever", note: "Never deleted" },
];

type Step = "words" | "photos" | "sending" | "done";

export default function CreatePage() {
  const [step, setStep] = useState<Step>("words");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [retention, setRetention] = useState<Retention>("30d");
  const [accepted, setAccepted] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; key: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void recordVisit();
  }, []);

  // Object URLs leak if the component unmounts mid-draft.
  useEffect(() => {
    return () => photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      setError(`That is the maximum of ${MAX_PHOTOS} photos.`);
      return;
    }

    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, room);

    setPhotos((prev) => [
      ...prev,
      ...picked.map((file) => ({
        file,
        note: "",
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    setError(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const setNote = (index: number, note: string) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, note } : p)));
  };

  const movePhoto = (index: number, delta: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const canContinue = to.trim() && from.trim() && message.trim();

  const submit = async () => {
    setStep("sending");
    setError(null);
    setProgress({ done: 0, total: photos.length });
    try {
      const result = await createWish(
        { to, from, message, photos, retention },
        (done, total) => setProgress({ done, total }),
      );
      setCreated(result);
      setStep("done");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong while sending. Please try again.",
      );
      setStep("photos");
    }
  };

  return (
    <PageShell petals={8}>
      <main className="mx-auto max-w-2xl px-6 pb-16 pt-10 sm:px-8">
        <AnimatePresence mode="wait">
          {/* ── Step 1 · the words ──────────────────────────────── */}
          {step === "words" && (
            <motion.section
              key="words"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <StepDots active={0} />
              <h1 className="mt-6 font-display text-4xl font-light leading-tight text-[var(--maroon)] sm:text-5xl">
                Who is this for?
              </h1>
              <p className="mt-3 font-sans text-sm text-[var(--muted)]">
                No account, no sign-up. You will get a link to send them.
              </p>

              <div className="mt-10 space-y-6">
                <Field
                  id="wish-to"
                  label="Their name"
                  value={to}
                  onChange={setTo}
                  placeholder="Ananya"
                  maxLength={40}
                />
                <Field
                  id="wish-from"
                  label="Your name"
                  value={from}
                  onChange={setFrom}
                  placeholder="Rohan"
                  maxLength={40}
                />

                <div>
                  <label
                    htmlFor="wish-message"
                    className="font-sans text-[0.68rem] uppercase tracking-[0.26em] text-[var(--muted)]"
                  >
                    Your message
                  </label>
                  <textarea
                    id="wish-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    maxLength={600}
                    placeholder={"Every year you tie this thread.\nEvery year I forget to tell you what it means."}
                    className="mt-2 w-full resize-none rounded-2xl border border-[var(--ivory-shadow)] bg-[var(--ivory)]/70 px-5 py-4 font-display text-lg italic leading-relaxed text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)]/55 focus:border-[var(--gold)]"
                  />
                  <p className="mt-2 font-sans text-[0.66rem] text-[var(--muted)]">
                    Each new line appears on its own, one after another.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep("photos")}
                className="mt-10 w-full rounded-full bg-[var(--maroon)] px-8 py-4 font-sans text-sm tracking-wide text-[var(--ivory)] transition enabled:hover:bg-[var(--maroon-soft)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Add your memories →
              </button>
            </motion.section>
          )}

          {/* ── Step 2 · the memories ───────────────────────────── */}
          {step === "photos" && (
            <motion.section
              key="photos"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <StepDots active={1} />
              <h1 className="mt-6 font-display text-4xl font-light leading-tight text-[var(--maroon)] sm:text-5xl">
                Your memories
              </h1>
              <p className="mt-3 font-sans text-sm text-[var(--muted)]">
                Add up to {MAX_PHOTOS}. Notes are optional — leave them blank and the
                photo speaks for itself.
              </p>

              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => addFiles(e.target.files)}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="mt-8 w-full rounded-2xl border border-dashed border-[var(--gold)]/55 bg-[var(--ivory-deep)]/40 px-6 py-9 font-sans text-sm text-[var(--maroon)] transition hover:border-[var(--gold)] hover:bg-[var(--ivory-deep)]/70"
              >
                <span className="block text-2xl">＋</span>
                <span className="mt-2 block">
                  {photos.length ? "Add more photos" : "Choose photos"}
                </span>
                <span className="mt-1 block font-sans text-[0.66rem] text-[var(--muted)]">
                  {photos.length}/{MAX_PHOTOS} added
                </span>
              </button>

              <div className="mt-6 space-y-4">
                {photos.map((photo, i) => (
                  <motion.div
                    key={photo.previewUrl}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 rounded-2xl border border-[var(--ivory-shadow)] bg-[var(--ivory)]/60 p-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.previewUrl}
                      alt=""
                      className="h-24 w-20 shrink-0 rounded-xl object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <textarea
                        value={photo.note}
                        onChange={(e) => setNote(i, e.target.value)}
                        rows={2}
                        maxLength={180}
                        placeholder="Add a note (optional)"
                        className="w-full flex-1 resize-none rounded-lg bg-transparent font-display text-base italic text-[var(--ink)] outline-none placeholder:not-italic placeholder:font-sans placeholder:text-xs placeholder:text-[var(--muted)]/70"
                      />
                      <div className="mt-1 flex items-center gap-3 font-sans text-[0.66rem] text-[var(--muted)]">
                        <button
                          type="button"
                          onClick={() => movePhoto(i, -1)}
                          disabled={i === 0}
                          className="disabled:opacity-25"
                          aria-label="Move earlier"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => movePhoto(i, 1)}
                          disabled={i === photos.length - 1}
                          className="disabled:opacity-25"
                          aria-label="Move later"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="ml-auto hover:text-[var(--maroon)]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── Retention ─────────────────────────────────── */}
              <div className="mt-12">
                <h2 className="font-sans text-[0.68rem] uppercase tracking-[0.26em] text-[var(--muted)]">
                  How long should it stay up?
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {RETENTION_CHOICES.map((choice) => {
                    const on = retention === choice.value;
                    return (
                      <button
                        key={choice.value}
                        type="button"
                        onClick={() => setRetention(choice.value)}
                        aria-pressed={on}
                        className={`rounded-xl border px-3 py-3 text-left transition ${
                          on
                            ? "border-[var(--gold)] bg-[var(--ivory-deep)]/70"
                            : "border-[var(--ivory-shadow)] bg-[var(--ivory)]/50 hover:border-[var(--gold)]/55"
                        }`}
                      >
                        <span
                          className={`block font-display text-lg ${
                            on ? "text-[var(--maroon)]" : "text-[var(--ink)]"
                          }`}
                        >
                          {choice.label}
                        </span>
                        <span className="mt-0.5 block font-sans text-[0.6rem] leading-tight text-[var(--muted)]">
                          {choice.note}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 font-sans text-[0.66rem] leading-relaxed text-[var(--muted)]">
                  Your photos and message are locked before they leave this device, with
                  a key that lives only in the link. We cannot open them, and when the
                  time is up they are deleted for good.
                </p>
              </div>

              {/* Explicit acceptance rather than a passive "by continuing you
                  agree" line — it is the difference between a term someone
                  was shown and one they actively accepted. */}
              <label className="mt-9 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--maroon)]"
                />
                <span className="font-sans text-[0.72rem] leading-relaxed text-[var(--muted)]">
                  These photos are mine to share, and anyone in them is happy for
                  me to. I accept the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-[var(--maroon-soft)] underline underline-offset-4"
                  >
                    terms of use
                  </Link>
                  .
                </span>
              </label>

              {error && (
                <p className="mt-5 rounded-xl bg-[var(--maroon)]/8 px-4 py-3 font-sans text-sm text-[var(--maroon)]">
                  {error}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("words")}
                  className="rounded-full border border-[var(--ivory-shadow)] px-6 py-4 font-sans text-sm text-[var(--muted)] transition hover:border-[var(--gold)] hover:text-[var(--maroon)]"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!accepted}
                  onClick={submit}
                  className="flex-1 rounded-full bg-[var(--maroon)] px-8 py-4 font-sans text-sm tracking-wide text-[var(--ivory)] transition enabled:hover:bg-[var(--maroon-soft)] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {photos.length ? "Create the wish" : "Create without photos"}
                </button>
              </div>
            </motion.section>
          )}

          {/* ── Sending ─────────────────────────────────────────── */}
          {step === "sending" && (
            <motion.section
              key="sending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[65vh] flex-col items-center justify-center text-center"
            >
              <div className="tz-breathe">
                <svg viewBox="0 0 120 120" className="w-24" fill="none">
                  <circle
                    cx="60"
                    cy="60"
                    r="44"
                    stroke="var(--gold)"
                    strokeWidth="1.5"
                    opacity="0.25"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="44"
                    stroke="var(--gold)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, rotate: 360 }}
                    transition={{
                      pathLength: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                    }}
                    style={{ transformOrigin: "60px 60px" }}
                  />
                </svg>
              </div>
              <p className="mt-8 font-display text-2xl font-light italic text-[var(--maroon)]">
                Tying it together…
              </p>
              {progress.total > 0 && (
                <p className="mt-2 font-sans text-sm text-[var(--muted)]">
                  {progress.done} of {progress.total} photos
                </p>
              )}
            </motion.section>
          )}

          {/* ── Step 3 · share ──────────────────────────────────── */}
          {step === "done" && created && (
            <motion.section
              key="done"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <StepDots active={2} />
              <h1 className="mt-6 font-display text-4xl font-light leading-tight text-[var(--maroon)] sm:text-5xl">
                It is ready.
              </h1>
              <p className="mt-3 font-sans text-sm leading-relaxed text-[var(--muted)]">
                Send this to {to.trim()}.{" "}
                {retention === "forever"
                  ? "It will stay up for good."
                  : `It deletes itself after ${RETENTION_CHOICES.find((c) => c.value === retention)!.label}.`}
              </p>

              <p className="mt-4 rounded-xl border border-[var(--gold)]/40 bg-[var(--ivory-deep)]/40 px-4 py-3 font-sans text-[0.7rem] leading-relaxed text-[var(--maroon)]">
                Send the link <strong className="font-semibold">whole</strong>. Everything
                after the <code className="font-mono">#</code> is the key that unlocks the
                photos — cut it off and not even we can open them.
              </p>

              <ShareBox
                path={`/w/${created.id}#k=${created.key}`}
                shareText={`${to.trim()}, I made something for you 🧡`}
                previewLabel="Preview it yourself"
              />

              <div className="mt-14">
                <ThreadRule />
              </div>

              <div className="mt-10">
                <h2 className="font-display text-2xl font-light text-[var(--maroon)]">
                  Now send something real
                </h2>
                <p className="mt-2 font-sans text-sm text-[var(--muted)]">
                  A wish travels instantly. A rakhi still has to be posted — and there
                  is time, if you go now.
                </p>
                <Link
                  href="/shop"
                  className="mt-6 inline-block rounded-full border border-[var(--gold)]/50 bg-[var(--ivory-deep)]/60 px-7 py-3.5 font-sans text-[0.8rem] tracking-wide text-[var(--maroon)] transition hover:border-[var(--gold)] hover:bg-[var(--ivory-deep)]"
                >
                  Browse rakhi gifts →
                </Link>
              </div>

              <div className="mt-12">
                <Link
                  href="/agreement"
                  className="font-sans text-sm text-[var(--maroon-soft)] underline-offset-4 hover:underline"
                >
                  Make them sign a sibling agreement too →
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

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength: number;
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
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-2 w-full rounded-full border border-[var(--ivory-shadow)] bg-[var(--ivory)]/70 px-5 py-3.5 font-display text-lg text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)]/55 focus:border-[var(--gold)]"
      />
    </div>
  );
}

function StepDots({ active }: { active: number }) {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-[3px] rounded-full transition-all duration-500 ${
            i === active
              ? "w-10 bg-[var(--gold)]"
              : i < active
                ? "w-5 bg-[var(--gold)]/50"
                : "w-5 bg-[var(--ivory-shadow)]"
          }`}
        />
      ))}
    </div>
  );
}
