"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { ShareBox } from "@/components/ShareBox";
import { ThreadRule } from "@/components/Ambient";
import { ReactionCharacter } from "@/components/ReactionCharacter";
import { CATEGORIES } from "@/lib/products";
import { recordVisit } from "@/lib/stats";
import {
  MAX_WISHES,
  MAX_WISH_CHARS,
  REACTIONS,
  createWishlist,
  defaultReaction,
  type DraftWish,
  type Reaction,
} from "@/lib/wishlist";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function WishlistBuilder() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [gender, setGender] = useState<"f" | "m">("f");
  const [wishes, setWishes] = useState<DraftWish[]>([
    { reaction: "request", text: "" },
  ]);
  const [openPicker, setOpenPicker] = useState<number | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; key: string | null } | null>(null);

  useEffect(() => {
    void recordVisit();
    // Arriving from someone else's list. Their name becomes the recipient,
    // and the link is recorded as this list's parent — the loop metric.
    const ref = new URLSearchParams(window.location.search).get("ref");
    const theirName = new URLSearchParams(window.location.search).get("from");
    if (ref) setParentId(ref);
    if (theirName) setTo(theirName.slice(0, 20));
  }, []);

  const setWish = (i: number, patch: Partial<DraftWish>) =>
    setWishes((prev) => prev.map((w, n) => (n === i ? { ...w, ...patch } : w)));

  const addWish = () =>
    setWishes((prev) =>
      prev.length >= MAX_WISHES
        ? prev
        : [...prev, { reaction: defaultReaction(prev.length), text: "" }],
    );

  const removeWish = (i: number) =>
    setWishes((prev) => {
      if (prev.length === 1) return prev;
      if (prev[i].previewUrl) URL.revokeObjectURL(prev[i].previewUrl!);
      return prev.filter((_, n) => n !== i);
    });

  const pickImage = (i: number, file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setWishes((prev) =>
      prev.map((w, n) => {
        if (n !== i) return w;
        if (w.previewUrl) URL.revokeObjectURL(w.previewUrl);
        return { ...w, file, previewUrl: URL.createObjectURL(file) };
      }),
    );
  };

  const clearImage = (i: number) =>
    setWishes((prev) =>
      prev.map((w, n) => {
        if (n !== i) return w;
        if (w.previewUrl) URL.revokeObjectURL(w.previewUrl);
        return { ...w, file: undefined, previewUrl: undefined };
      }),
    );

  const filled = wishes.filter((w) => w.text.trim()).length;
  const canSend = from.trim() && to.trim() && filled > 0;

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await createWishlist({ from, to, fromGender: gender, wishes, parentId });
      setCreated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the list.");
    } finally {
      setSaving(false);
    }
  };

  if (created) {
    return (
      <PageShell petals={8} seed={71}>
        <main className="mx-auto max-w-2xl px-6 pb-16 pt-10 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl font-light leading-tight text-[var(--maroon)] sm:text-5xl">
              Your demands are ready.
            </h1>
            <p className="mt-3 font-sans text-sm text-[var(--muted)]">
              Send this to {to.trim()}. They can send theirs back.
            </p>

            <ShareBox
              path={`/list/${created.id}${created.key ? `#k=${created.key}` : ""}`}
              shareText={`${to.trim()}, I made my Raksha Bandhan list 😤`}
              previewLabel="See what they will see"
            />

            {created.key && (
              <p className="mt-4 rounded-xl border border-[var(--gold)]/40 bg-[var(--ivory-deep)]/40 px-4 py-3 font-sans text-[0.7rem] leading-relaxed text-[var(--maroon)]">
                Send the link <strong className="font-semibold">whole</strong> — the part
                after the <code className="font-mono">#</code> unlocks your pictures.
              </p>
            )}

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
                Browse gifts yourself
              </Link>
            </div>
          </motion.div>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell petals={8} seed={71}>
      <main className="mx-auto max-w-2xl px-6 pb-16 pt-10 sm:px-8">
        <p className="font-sans text-[0.66rem] uppercase tracking-[0.38em] text-[var(--muted)]">
          {parentId ? "Your turn" : "Entirely shameless"}
        </p>
        <h1 className="mt-4 font-display text-4xl font-light leading-tight text-[var(--maroon)] sm:text-5xl">
          Your Raksha Bandhan list
        </h1>
        <p className="mt-3 font-sans text-sm leading-relaxed text-[var(--muted)]">
          Up to six demands, each with a face. Send it to your sibling before they
          think of it first.
        </p>

        {/* Names */}
        <div className="mt-9 grid gap-5 sm:grid-cols-2">
          <Field id="wl-from" label="Your name" value={from} onChange={setFrom} />
          <Field id="wl-to" label="Their name" value={to} onChange={setTo} />
        </div>

        <div className="mt-6">
          <span className="font-sans text-[0.68rem] uppercase tracking-[0.26em] text-[var(--muted)]">
            You are their
          </span>
          <div className="mt-2 flex gap-2">
            {(
              [
                { v: "f", label: "Sister" },
                { v: "m", label: "Brother" },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setGender(o.v)}
                aria-pressed={gender === o.v}
                className={`rounded-full border px-6 py-2.5 font-sans text-sm transition ${
                  gender === o.v
                    ? "border-[var(--gold)] bg-[var(--ivory-deep)] text-[var(--maroon)]"
                    : "border-[var(--ivory-shadow)] text-[var(--muted)] hover:border-[var(--gold)]/60"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 space-y-8">
          {wishes.map((wish, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--ivory-shadow)] bg-[var(--ivory)]/60 p-5"
            >
              <div className="flex items-start justify-between">
                <span className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-[var(--gold)]">
                  Demand {i + 1}
                </span>
                {wishes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWish(i)}
                    className="font-sans text-[0.68rem] text-[var(--muted)] hover:text-[var(--maroon)]"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="mt-3 flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => setOpenPicker(openPicker === i ? null : i)}
                  className="shrink-0 rounded-2xl border border-transparent transition hover:border-[var(--gold)]/50"
                  aria-label="Change the reaction"
                >
                  <ReactionCharacter reaction={wish.reaction} gender={gender} size={104} />
                </button>

                <div className="min-w-0 flex-1">
                  <textarea
                    value={wish.text}
                    onChange={(e) => setWish(i, { text: e.target.value })}
                    rows={2}
                    maxLength={MAX_WISH_CHARS}
                    placeholder={
                      i === 0 ? "Add your first demand. Be shameless." : "And another…"
                    }
                    className="w-full resize-none rounded-xl border border-[var(--ivory-shadow)] bg-[var(--ivory)] px-4 py-3 font-display text-lg text-[var(--ink)] outline-none transition placeholder:font-sans placeholder:text-xs placeholder:text-[var(--muted)]/70 focus:border-[var(--gold)]"
                  />
                  {/* A picture of the thing, optional. Encrypted on upload
                      like everything else, so the site keeps one promise
                      rather than two different ones. */}
                  <div className="mt-2 flex items-center gap-3">
                    {wish.previewUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={wish.previewUrl}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => clearImage(i)}
                          className="font-sans text-[0.68rem] text-[var(--muted)] underline-offset-4 hover:text-[var(--maroon)] hover:underline"
                        >
                          Remove picture
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer font-sans text-[0.68rem] text-[var(--maroon-soft)] underline-offset-4 hover:underline">
                        + Add a picture
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => pickImage(i, e.target.files?.[0])}
                        />
                      </label>
                    )}
                  </div>

                  <div className="mt-1.5 flex items-center justify-between">
                    <select
                      value={wish.categoryId ?? ""}
                      onChange={(e) =>
                        setWish(i, {
                          categoryId: e.target.value || undefined,
                          pickIndex: 0,
                        })
                      }
                      className="max-w-[62%] rounded-full border border-[var(--ivory-shadow)] bg-transparent px-3 py-1.5 font-sans text-[0.68rem] text-[var(--muted)] outline-none focus:border-[var(--gold)]"
                    >
                      <option value="">Link a gift (optional)</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    <span className="font-sans text-[0.62rem] text-[var(--muted)]">
                      {wish.text.length}/{MAX_WISH_CHARS}
                    </span>
                  </div>
                </div>
              </div>

              {openPicker === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {REACTIONS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setWish(i, { reaction: r.id as Reaction });
                          setOpenPicker(null);
                        }}
                        className={`rounded-xl border p-1 transition ${
                          wish.reaction === r.id
                            ? "border-[var(--gold)] bg-[var(--ivory-deep)]"
                            : "border-[var(--ivory-shadow)] hover:border-[var(--gold)]/60"
                        }`}
                        title={r.label}
                      >
                        <ReactionCharacter reaction={r.id} gender={gender} size={66} />
                        <span className="block pb-1 font-sans text-[0.55rem] text-[var(--muted)]">
                          {r.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {wishes.length < MAX_WISHES && (
          <button
            type="button"
            onClick={addWish}
            className="mt-6 w-full rounded-2xl border border-dashed border-[var(--gold)]/55 px-6 py-5 font-sans text-sm text-[var(--maroon)] transition hover:bg-[var(--ivory-deep)]/50"
          >
            + Add another demand ({wishes.length}/{MAX_WISHES})
          </button>
        )}

        {error && (
          <p className="mt-6 rounded-xl bg-[var(--maroon)]/8 px-4 py-3 font-sans text-sm text-[var(--maroon)]">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={!canSend || saving}
          onClick={submit}
          className="mt-8 w-full rounded-full bg-[var(--maroon)] px-8 py-4 font-sans text-sm tracking-wide text-[var(--ivory)] transition enabled:hover:bg-[var(--maroon-soft)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          {saving ? "Sealing it…" : `Send ${filled || ""} demand${filled === 1 ? "" : "s"} →`}
        </button>
      </main>
    </PageShell>
  );
}

function Field({
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
        maxLength={20}
        className="mt-2 w-full rounded-full border border-[var(--ivory-shadow)] bg-[var(--ivory)]/70 px-5 py-3.5 font-display text-lg text-[var(--ink)] outline-none transition focus:border-[var(--gold)]"
      />
    </div>
  );
}
