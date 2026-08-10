"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AmbientScore, MUTE_STORAGE_KEY } from "@/lib/audio";
import { importKey, keyFromLocation } from "@/lib/crypto";
import { recordVisit } from "@/lib/stats";
import { openWish, type OpenPhoto } from "@/lib/wishes";
import { RETENTION_LABEL, type Wish } from "@/lib/types";
import { Bloom, Petals, ThreadRule } from "./Ambient";
import { MuteButton } from "./MuteButton";
import { SealedLetter } from "./SealedLetter";
import { ThreadSpine } from "./ThreadSpine";
import { WishUnavailable } from "./WishUnavailable";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Content {
  message: string;
  photos: OpenPhoto[];
}

export default function WishExperience({ wish }: { wish: Wish }) {
  const [content, setContent] = useState<Content | null>(null);
  const [untied, setUntied] = useState(false);
  const [failure, setFailure] = useState<"no-key" | "undecryptable" | null>(null);
  const [muted, setMuted] = useState(false);

  const scoreRef = useRef<AmbientScore | null>(null);
  const openedRef = useRef(false);
  const contentRef = useRef<Content | null>(null);
  const reduced = useReducedMotion();

  // Catch a missing key before the reader taps, so they are not led through
  // the whole unwrapping only to hit a wall at the end.
  useEffect(() => {
    if (!wish.plaintext && !keyFromLocation()) setFailure("no-key");
  }, [wish.plaintext]);

  useEffect(() => {
    try {
      if (localStorage.getItem(MUTE_STORAGE_KEY) === "1") setMuted(true);
    } catch {
      /* storage blocked; default to sound on */
    }
    void recordVisit();
  }, []);

  useEffect(() => {
    document.body.style.overflow = content && untied ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [content, untied]);

  useEffect(() => {
    return () => {
      scoreRef.current?.dispose();
      // Blob URLs survive navigation unless revoked.
      contentRef.current?.photos.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    };
  }, []);

  /**
   * Fires on the tap, alongside the audio unlock. Decryption and the photo
   * downloads run underneath the 1.65s untie animation, so the wait is hidden
   * inside a beat the reader already expects.
   */
  const beginOpening = () => {
    if (openedRef.current) return;
    openedRef.current = true;

    if (!scoreRef.current) {
      scoreRef.current = new AmbientScore();
      void scoreRef.current.start(muted);
    }

    void (async () => {
      try {
        if (wish.plaintext) {
          const plain: Content = {
            message: wish.message,
            photos: wish.photos.map((p) => ({
              objectUrl: p.url,
              note: p.note,
              w: p.w,
              h: p.h,
            })),
          };
          contentRef.current = plain;
          setContent(plain);
          return;
        }

        const encoded = keyFromLocation();
        if (!encoded) {
          setFailure("no-key");
          return;
        }

        const opened = await openWish(wish, await importKey(encoded));
        contentRef.current = opened;
        setContent(opened);
      } catch (err) {
        console.error(err);
        setFailure("undecryptable");
      }
    })();
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    scoreRef.current?.setMuted(next);
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* preference simply will not persist */
    }
  };

  if (failure) {
    return <WishUnavailable variant={failure} to={wish.to} from={wish.from} />;
  }

  const ready = Boolean(content) && untied;
  const lines = (content?.message ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="relative min-h-dvh bg-[var(--ivory)]">
      <Bloom />
      <Petals count={ready ? 21 : 12} />

      <AnimatePresence>
        {!ready && (
          <div key="sealed" onPointerDown={beginOpening}>
            <SealedLetter
              to={wish.to}
              from={wish.from}
              onOpen={() => setUntied(true)}
              waiting={untied && !content}
            />
          </div>
        )}
      </AnimatePresence>

      {ready && content && (
        <>
          <ThreadSpine />
          <MuteButton muted={muted} onToggle={toggleMute} />

          <main className="relative z-30">
            {/* ── Act 2 · the message ─────────────────────────────── */}
            <section className="flex min-h-dvh flex-col items-center justify-center px-7 py-24 text-center">
              <motion.p
                className="font-sans text-[0.68rem] uppercase tracking-[0.42em] text-[var(--muted)]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.35 }}
              >
                Happy Raksha Bandhan
              </motion.p>

              <motion.h1
                className="mt-5 font-display text-[3rem] font-light leading-[0.95] text-[var(--maroon)] sm:text-7xl"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.3, delay: 0.55, ease: EASE }}
              >
                {wish.to}
              </motion.h1>

              <motion.div
                className="mt-8 w-24"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 1.1, delay: 1 }}
              >
                <ThreadRule />
              </motion.div>

              <div className="mt-10 max-w-xl space-y-4">
                {lines.map((line, i) => (
                  <motion.p
                    key={i}
                    className="font-display text-[1.42rem] font-light italic leading-relaxed text-[var(--ink)] sm:text-3xl"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.1, delay: 1.25 + i * 0.42, ease: EASE }}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>

              {content.photos.length > 0 && (
                <motion.div
                  className={`mt-16 flex flex-col items-center gap-3 ${reduced ? "" : "tz-float"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 1.5 + lines.length * 0.42 }}
                >
                  <span className="font-sans text-[0.62rem] uppercase tracking-[0.34em] text-[var(--muted)]">
                    Our memories
                  </span>
                  <svg width="15" height="24" viewBox="0 0 15 24" fill="none" aria-hidden>
                    <path
                      d="M7.5 1v20m0 0 5.5-6m-5.5 6L2 15"
                      stroke="var(--gold)"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.div>
              )}
            </section>

            {/* ── Act 3 · the memories ────────────────────────────── */}
            {content.photos.map((photo, i) => (
              <section key={photo.objectUrl} className="px-0 py-[11vh]">
                <figure className="m-0">
                  <div
                    className="relative w-full overflow-hidden bg-[var(--ivory-deep)]"
                    style={{
                      aspectRatio: `${photo.w || 4} / ${photo.h || 3}`,
                      maxHeight: "82vh",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.objectUrl}
                      alt={photo.note || `A memory shared with ${wish.to}`}
                      decoding="async"
                      className={`absolute inset-0 h-full w-full object-cover ${
                        i % 2 === 0 ? "tz-kenburns" : "tz-kenburns-alt"
                      }`}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(253,249,243,0.5) 0%, rgba(253,249,243,0) 18%, rgba(253,249,243,0) 82%, rgba(253,249,243,0.55) 100%)",
                      }}
                    />

                    {/* The reveal: an ivory curtain drawn upward off the
                        photograph, with the gold thread riding its edge.
                        Pure translate, so it stays on the compositor — a
                        blur or clip-path reveal looks similar and costs far
                        more on the phones this will mostly open on. */}
                    <motion.div
                      aria-hidden
                      className="absolute inset-0 z-10 bg-[var(--ivory)]"
                      initial={{ y: "0%" }}
                      whileInView={{ y: "-101%" }}
                      viewport={{ once: true, margin: "-18%" }}
                      transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
                    />
                    <motion.div
                      aria-hidden
                      className="absolute inset-x-0 top-0 z-20 h-px"
                      style={{ background: "var(--gold)" }}
                      initial={{ y: "0vh", opacity: 0 }}
                      whileInView={{ y: "-101%", opacity: [0, 1, 1, 0] }}
                      viewport={{ once: true, margin: "-18%" }}
                      transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
                    />
                  </div>

                  {photo.note && (
                    <motion.figcaption
                      className="mx-auto mt-8 max-w-lg px-8 text-center font-display text-[1.32rem] font-light italic leading-relaxed text-[var(--maroon-soft)] sm:text-2xl"
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-8%" }}
                      transition={{ duration: 1.3, delay: 0.75, ease: EASE }}
                    >
                      {photo.note}
                    </motion.figcaption>
                  )}
                </figure>
              </section>
            ))}

            {/* ── A blessing before the close ─────────────────────── */}
            <section className="flex min-h-[62vh] flex-col items-center justify-center px-7 text-center">
              <motion.p
                className="max-w-lg font-display text-[1.7rem] font-light italic leading-relaxed text-[var(--maroon-soft)] sm:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 1.6, ease: EASE }}
              >
                Distance is only distance.
              </motion.p>
              <motion.p
                className="mt-5 max-w-lg font-display text-[1.7rem] font-light italic leading-relaxed text-[var(--maroon)] sm:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 1.6, delay: 0.9, ease: EASE }}
              >
                The thread holds anyway.
              </motion.p>
            </section>

            {/* ── Act 4 · the close ───────────────────────────────── */}
            <section className="flex min-h-dvh flex-col items-center justify-center px-7 pb-24 pt-12 text-center">
              <ClosingBow />

              <motion.p
                className="mt-9 font-display text-2xl font-light italic text-[var(--maroon)] sm:text-3xl"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
              >
                with all my love,
              </motion.p>

              <motion.p
                className="mt-2 font-display text-[2.6rem] font-light leading-tight text-[var(--maroon)] sm:text-5xl"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.75, ease: EASE }}
              >
                {wish.from}
              </motion.p>

              <motion.div
                className="mt-14 w-full max-w-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 1 }}
              >
                <ThreadRule />

                {/* The recipient is the one whose face is in these photographs.
                    They deserve to know where they ended up as much as the
                    sender does. */}
                {!wish.plaintext && (
                  <p className="mt-7 font-sans text-[0.68rem] leading-relaxed text-[var(--muted)]">
                    These photographs were locked on {wish.from}&apos;s phone before
                    they were sent. Trendza cannot open them.
                    {wish.expiresAt !== null ? (
                      <>
                        {" "}
                        They are deleted for good on{" "}
                        <ExpiryDate at={wish.expiresAt} /> — save any you want to
                        keep.{" "}
                      </>
                    ) : (
                      " "
                    )}
                    <Link
                      href="/privacy"
                      className="text-[var(--maroon-soft)] underline-offset-4 hover:underline"
                    >
                      How this works
                    </Link>
                  </p>
                )}

                <div className="mt-9 flex flex-col gap-3">
                  <Link
                    href="/shop"
                    className="rounded-full border border-[var(--gold)]/45 bg-[var(--ivory-deep)]/60 px-7 py-3.5 font-sans text-[0.8rem] tracking-wide text-[var(--maroon)] transition hover:border-[var(--gold)] hover:bg-[var(--ivory-deep)]"
                  >
                    Send {wish.from} something real →
                  </Link>
                  <Link
                    href="/create"
                    className="rounded-full bg-[var(--maroon)] px-7 py-3.5 font-sans text-[0.8rem] tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
                  >
                    Make one for your sibling
                  </Link>
                </div>

                {/* The single mention of the brand on this whole page. */}
                <p className="mt-8 font-sans text-[0.62rem] uppercase tracking-[0.34em] text-[var(--muted)]">
                  made on{" "}
                  <Link href="/" className="text-[var(--maroon-soft)] hover:underline">
                    Trendza
                  </Link>
                </p>
              </motion.div>
            </section>
          </main>
        </>
      )}
    </div>
  );
}

/** Rendered after mount — the reader's locale and timezone are not known on the server. */
function ExpiryDate({ at }: { at: number }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(
      new Date(at).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
      }),
    );
  }, [at]);
  return <span className="text-[var(--maroon-soft)]">{text || "…"}</span>;
}

/** The thread ties itself back up — the story closing the way it opened. */
function ClosingBow() {
  return (
    <motion.svg
      viewBox="0 0 200 90"
      className="w-44 sm:w-52"
      fill="none"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true }}
    >
      {[
        "M100 45 C 70 20, 40 30, 46 46 C 52 62, 84 58, 100 45",
        "M100 45 C 130 20, 160 30, 154 46 C 148 62, 116 58, 100 45",
        "M92 52 L78 84",
        "M108 52 L122 84",
      ].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke="var(--gold)"
          strokeWidth="2.1"
          strokeLinecap="round"
          variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1 } }}
          transition={{ duration: 1.15, delay: i * 0.2, ease: EASE }}
        />
      ))}
      <motion.circle
        cx="100"
        cy="45"
        r="7"
        fill="var(--gold)"
        variants={{ hidden: { scale: 0 }, shown: { scale: 1 } }}
        style={{ transformOrigin: "100px 45px" }}
        transition={{ duration: 0.6, delay: 0.85, ease: EASE }}
      />
    </motion.svg>
  );
}
