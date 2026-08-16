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
import { Petals, ThreadRule } from "./Ambient";
import { Atmosphere } from "./Atmosphere";
import { Diya, MemoryVine } from "./Ornaments";

/** Keeps each photograph's petals in a different place to the last one's. */
const photoIndexSeed = (i: number) => 101 + i * 37;
import { WordReveal } from "./WordReveal";
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
      <Atmosphere />
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

                <div className="mt-8 space-y-4">
                  {lines.map((line, i) => (
                    <WordReveal
                      key={i}
                      text={line}
                      delay={0.95 + i * 1.15}
                      className="font-display text-[1.45rem] font-light italic leading-relaxed text-[var(--ink)] sm:text-[1.8rem]"
                    />
                  ))}
                </div>
              </div>
            ) : photoIndex < photos.length ? (
              <PhotoCard
                photo={photos[photoIndex]}
                to={wish.to}
                reduced={Boolean(reduced)}
                index={photoIndex}
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
                {/* A lamp lit beside the signature. It is the one moment on
                    the page that is purely ceremonial, so it earns it. */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: EASE }}
                >
                  <Diya size={78} />
                </motion.div>

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
  index,
}: {
  photo: OpenPhoto;
  to: string;
  reduced: boolean;
  index: number;
}) {
  const ratio = (photo.w || 4) / (photo.h || 3);
  // A degree of tilt, alternating, so a run of photographs reads as things
  // laid on a table rather than a column of identical rectangles.
  const tilt = (index % 2 === 0 ? -1 : 1) * 1.4;

  return (
    <figure className="relative m-0 text-center">
      {/* Petals gathering around this photograph specifically, so a memory
          feels attended to rather than sitting on a background. */}
      <Petals count={7} seed={photoIndexSeed(index)} />

      <motion.div
        className="tz-keepsake relative mx-auto"
        style={{ width: `min(100%, calc(52vh * ${ratio}))` }}
        initial={{ opacity: 0, y: 42, scale: 0.9, rotate: tilt * 3 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: tilt }}
        transition={{ duration: 1.15, ease: EASE }}
      >
        {/* A vine grows around the print and flowers at each corner */}
        <MemoryVine delay={0.55} />

        {/* Corner brackets, the way a photograph is held into an album page */}
        {[
          "left-1.5 top-1.5",
          "right-1.5 top-1.5 rotate-90",
          "right-1.5 bottom-1.5 rotate-180",
          "left-1.5 bottom-1.5 -rotate-90",
        ].map((pos, i) => (
          <motion.svg
            key={pos}
            viewBox="0 0 24 24"
            className={`absolute z-10 h-5 w-5 ${pos}`}
            fill="none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 + i * 0.09, ease: EASE }}
            aria-hidden
          >
            <path d="M2 10 V 2 H 10" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
          </motion.svg>
        ))}

        <div
          className={`relative overflow-hidden ${reduced ? "" : "tz-drift"}`}
          style={{ aspectRatio: `${photo.w || 4} / ${photo.h || 3}` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.objectUrl}
            alt={photo.note || `A memory shared with ${to}`}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* light sweeping across the print as it lands */}
          {!reduced && (
            <div
              aria-hidden
              className="tz-sheen absolute inset-y-[-30%] left-0 w-1/3"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(255,255,255,0.55), transparent)",
              }}
            />
          )}
        </div>

        {/* the caption, written on the album page itself */}
        {photo.note && (
          <motion.figcaption
            className="absolute inset-x-4 bottom-3 font-display text-[1.05rem] font-light italic leading-snug text-[var(--maroon-soft)] sm:text-[1.25rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            {photo.note}
          </motion.figcaption>
        )}
      </motion.div>
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
