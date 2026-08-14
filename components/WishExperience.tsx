"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AmbientScore, MUTE_STORAGE_KEY } from "@/lib/audio";
import { blessingFor } from "@/lib/blessings";
import { importKey, keyFromLocation } from "@/lib/crypto";
import { recordVisit } from "@/lib/stats";
import { openWish, type OpenPhoto } from "@/lib/wishes";
import { RETENTION_LABEL, type Wish } from "@/lib/types";
import { Bloom, Petals, ThreadRule } from "./Ambient";
import { Deck } from "./Deck";
import { GiftThread } from "./GiftThread";
import { MuteButton } from "./MuteButton";
import { SealedLetter } from "./SealedLetter";
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
  const [index, setIndex] = useState(0);

  const scoreRef = useRef<AmbientScore | null>(null);
  const openedRef = useRef(false);
  const contentRef = useRef<Content | null>(null);
  const reduced = useReducedMotion();

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
    return () => {
      scoreRef.current?.dispose();
      contentRef.current?.photos.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    };
  }, []);

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
        if (!encoded) return setFailure("no-key");
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

  const photos = content?.photos ?? [];
  const blessing = blessingFor(wish.id);
  // message · one card per photograph · blessing · close
  const total = photos.length + 3;
  const photoIndex = index - 1;

  return (
    <div className="relative min-h-dvh bg-[var(--ivory)]">
      <Bloom />
      <Petals count={ready ? 16 : 12} />

      {/* Plain conditional, not AnimatePresence. Its exit never completed here,
          which left the letter mounted on top of the deck swallowing every tap.
          The letter already plays its own untie before `ready` flips, so there
          is nothing left worth crossfading and a lot to lose by getting it
          wrong. */}
      {!ready && (
        <SealedLetter
          to={wish.to}
          from={wish.from}
          onOpen={() => setUntied(true)}
          onFirstTouch={beginOpening}
          waiting={untied && !content}
        />
      )}

      {ready && content && (
        <>
          <MuteButton muted={muted} onToggle={toggleMute} />

          <Deck count={total} index={index} onIndex={setIndex} tone="quiet">
            {index === 0 ? (
              <div className="text-center">
                <motion.p
                  className="font-sans text-[0.66rem] uppercase tracking-[0.42em] text-[var(--muted)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.25 }}
                >
                  Happy Raksha Bandhan
                </motion.p>

                <motion.h1
                  className="mt-4 font-display text-[3rem] font-light leading-[0.95] text-[var(--maroon)] sm:text-6xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.4, ease: EASE }}
                >
                  {wish.to}
                </motion.h1>

                <motion.div
                  className="mx-auto mt-7 w-20"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.75 }}
                >
                  <ThreadRule />
                </motion.div>

                <div className="mt-8 space-y-3.5">
                  {lines.map((line, i) => (
                    <motion.p
                      key={i}
                      className="font-display text-[1.35rem] font-light italic leading-relaxed text-[var(--ink)] sm:text-2xl"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.95 + i * 0.38, ease: EASE }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>
              </div>
            ) : photoIndex < photos.length ? (
              <PhotoCard
                photo={photos[photoIndex]}
                to={wish.to}
                reduced={Boolean(reduced)}
              />
            ) : photoIndex === photos.length ? (
              <div className="text-center">
                <motion.p
                  className="font-display text-[1.7rem] font-light italic leading-relaxed text-[var(--maroon-soft)] sm:text-4xl"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.3, ease: EASE }}
                >
                  {blessing.first}
                </motion.p>
                <motion.p
                  className="mt-5 font-display text-[1.7rem] font-light italic leading-relaxed text-[var(--maroon)] sm:text-4xl"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.3, delay: 0.7, ease: EASE }}
                >
                  {blessing.second}
                </motion.p>
              </div>
            ) : (
              <div className="pointer-events-auto text-center">
                <ClosingBow />

                <motion.p
                  className="mt-7 font-display text-xl font-light italic text-[var(--maroon)] sm:text-2xl"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5, ease: EASE }}
                >
                  with all my love,
                </motion.p>
                <motion.p
                  className="mt-1 font-display text-[2.4rem] font-light leading-tight text-[var(--maroon)] sm:text-5xl"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.7, ease: EASE }}
                >
                  {wish.from}
                </motion.p>

                <motion.div
                  className="mx-auto mt-10 w-full max-w-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.95 }}
                >
                  <ThreadRule />

                  <Link
                    href="/create"
                    className="mt-7 block rounded-full bg-[var(--maroon)] px-7 py-3.5 font-sans text-[0.8rem] tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
                  >
                    Make one for your sibling
                  </Link>

                  <GiftThread from={wish.from} />

                  <p className="mt-8 font-sans text-[0.6rem] uppercase tracking-[0.34em] text-[var(--muted)]">
                    made on{" "}
                    <Link href="/" className="text-[var(--maroon-soft)] hover:underline">
                      Trendza
                    </Link>
                  </p>

                  {!wish.plaintext && (
                    <p className="mt-2.5 font-sans text-[0.62rem] text-[var(--muted)]">
                      {wish.expiresAt !== null ? (
                        <>
                          Private. Kept for {RETENTION_LABEL[wish.retention]}.{" "}
                        </>
                      ) : (
                        <>Private to this link. </>
                      )}
                      <Link
                        href="/privacy"
                        className="text-[var(--maroon-soft)] underline-offset-4 hover:underline"
                      >
                        Why
                      </Link>
                    </p>
                  )}
                </motion.div>
              </div>
            )}
          </Deck>
        </>
      )}
    </div>
  );
}

/**
 * One photograph, filling its card. Sized from the picture's own shape so
 * nothing is cropped, and drifting gently rather than sitting still — the
 * frame moves, never the image inside it, so no edge is ever cut off.
 */
function PhotoCard({
  photo,
  to,
  reduced,
}: {
  photo: OpenPhoto;
  to: string;
  reduced: boolean;
}) {
  const ratio = (photo.w || 4) / (photo.h || 3);

  return (
    <figure className="m-0 text-center">
      <motion.div
        className={`relative mx-auto overflow-hidden rounded-sm bg-[var(--ivory-deep)] ${
          reduced ? "" : "tz-drift"
        }`}
        style={{
          aspectRatio: `${photo.w || 4} / ${photo.h || 3}`,
          width: `min(100%, calc(58vh * ${ratio}))`,
        }}
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.objectUrl}
          alt={photo.note || `A memory shared with ${to}`}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </motion.div>

      {photo.note && (
        <motion.figcaption
          className="mx-auto mt-6 max-w-md px-4 font-display text-[1.2rem] font-light italic leading-relaxed text-[var(--maroon-soft)] sm:text-2xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55, ease: EASE }}
        >
          {photo.note}
        </motion.figcaption>
      )}
    </figure>
  );
}

/** The thread ties itself back up — the story closing the way it opened. */
function ClosingBow() {
  return (
    <motion.svg
      viewBox="0 0 200 90"
      className="mx-auto w-36 sm:w-44"
      fill="none"
      initial="hidden"
      animate="shown"
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
          transition={{ duration: 1.05, delay: i * 0.18, ease: EASE }}
        />
      ))}
      <motion.circle
        cx="100"
        cy="45"
        r="7"
        fill="var(--gold)"
        variants={{ hidden: { scale: 0 }, shown: { scale: 1 } }}
        style={{ transformOrigin: "100px 45px" }}
        transition={{ duration: 0.55, delay: 0.8, ease: EASE }}
      />
    </motion.svg>
  );
}
