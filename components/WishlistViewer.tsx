"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Deck } from "./Deck";
import { RakhiScene, ReactionCharacter } from "./ReactionCharacter";
import { MuteButton } from "./MuteButton";
import { keyFromLocation } from "@/lib/crypto";
import { recordVisit } from "@/lib/stats";
import { sfxBack, sfxFinale, sfxLand, sfxTap, sfxThud, setSfxMuted } from "@/lib/sfx";
import {
  countView,
  linkForWish,
  openWishlistImages,
  type Reaction,
  type Wishlist,
} from "@/lib/wishlist";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * How each reaction arrives. The reaction is the joke, so it performs rather
 * than fading in — five identical entrances would waste the only moment the
 * character has to be funny.
 */
const ENTRANCE: Record<Reaction, { from: Record<string, number>; spring: object }> = {
  request: { from: { x: -90, opacity: 0 }, spring: { type: "spring", stiffness: 120, damping: 14 } },
  show: { from: { scale: 0.55, opacity: 0 }, spring: { type: "spring", stiffness: 200, damping: 11 } },
  beg: { from: { y: 130, opacity: 0 }, spring: { type: "spring", stiffness: 150, damping: 13 } },
  mercy: { from: { y: -90, opacity: 0 }, spring: { type: "spring", stiffness: 130, damping: 12 } },
  threat: { from: { x: 130, opacity: 0 }, spring: { type: "spring", stiffness: 260, damping: 15 } },
  celebrate: { from: { scale: 0.7, opacity: 0 }, spring: { type: "spring", stiffness: 180, damping: 12 } },
};

export default function WishlistViewer({ list }: { list: Wishlist }) {
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState<Record<number, string>>({});
  const [muted, setMuted] = useState(false);
  const reduced = useReducedMotion();

  const total = list.wishes.length + 2; // hero + demands + finale
  const demandIndex = index - 1;
  const onFinale = index === total - 1;

  useEffect(() => {
    void recordVisit();
    countView(list.id);
  }, [list.id]);

  useEffect(() => {
    if (!list.wishes.some((w) => w.image)) return;
    const encoded = keyFromLocation();
    if (!encoded) return;

    let live = true;
    let created: Record<number, string> = {};
    void openWishlistImages(list.wishes, encoded).then((urls) => {
      created = urls;
      if (live) setImages(urls);
      else Object.values(urls).forEach(URL.revokeObjectURL);
    });
    return () => {
      live = false;
      Object.values(created).forEach(URL.revokeObjectURL);
    };
  }, [list.wishes]);

  // The sound belongs to the card being arrived at, not the tap itself.
  useEffect(() => {
    if (index === 0) return;
    if (onFinale) return void sfxFinale();
    const wish = list.wishes[demandIndex];
    if (wish?.reaction === "threat") sfxThud();
    else sfxLand();
  }, [index, onFinale, demandIndex, list.wishes]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setSfxMuted(next);
  };

  const loopHref = `/wishlist?ref=${encodeURIComponent(list.id)}&from=${encodeURIComponent(list.from)}`;

  return (
    <>
      <MuteButton muted={muted} onToggle={toggleMute} />

      <Deck
        count={total}
        index={index}
        onIndex={setIndex}
        onAdvanceSound={(d) => (d === 1 ? sfxTap() : sfxBack())}
      >
        {index === 0 ? (
          <div className="text-center">
            <motion.p
              className="font-sans text-[0.66rem] uppercase tracking-[0.4em] text-[var(--muted)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              Yes, you
            </motion.p>

            <motion.h1
              className="mt-3 font-display text-[3.4rem] font-light leading-[0.92] text-[var(--maroon)] sm:text-7xl"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 170, damping: 12, delay: 0.25 }}
            >
              {list.to}
            </motion.h1>

            <motion.p
              className="mx-auto mt-4 max-w-xs font-display text-xl font-light italic text-[var(--ink)] sm:text-2xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
            >
              {list.from} has {list.wishes.length} demand
              {list.wishes.length === 1 ? "" : "s"}.
            </motion.p>

            <motion.div
              className="mt-6 flex justify-center"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 13, delay: 0.7 }}
            >
              <ReactionCharacter
                reaction={list.wishes[0]?.reaction ?? "request"}
                gender={list.fromGender}
                size={240}
              />
            </motion.div>
          </div>
        ) : onFinale ? (
          <div className="pointer-events-auto text-center">
            <motion.div
              className="mx-auto w-56 sm:w-72"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 13 }}
            >
              <RakhiScene scene="blessing" width={300} />
            </motion.div>

            <motion.p
              className="mt-6 font-display text-2xl font-light italic text-[var(--maroon-soft)]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              That is the whole list. Not asking for much, honestly.
            </motion.p>

            <motion.p
              className="mt-8 font-display text-4xl font-light text-[var(--maroon)] sm:text-5xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.45 }}
            >
              Your turn.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Link
                href={loopHref}
                className="mt-7 block w-full rounded-full bg-[var(--maroon)] px-8 py-5 font-sans text-base tracking-wide text-[var(--ivory)] shadow-lg shadow-[var(--maroon)]/20 transition hover:bg-[var(--maroon-soft)]"
              >
                Make your list →
              </Link>

              <div className="mt-5 flex flex-col gap-2.5">
                <Link
                  href="/shop"
                  className="rounded-full border border-[var(--gold)]/50 px-7 py-3 font-sans text-[0.78rem] tracking-wide text-[var(--maroon)] transition hover:bg-[var(--ivory-deep)]"
                >
                  Or just buy them something →
                </Link>
                <Link
                  href="/create"
                  className="font-sans text-[0.74rem] text-[var(--muted)] underline-offset-4 hover:text-[var(--maroon-soft)] hover:underline"
                >
                  Send {list.from} a rakhi wish instead
                </Link>
              </div>
            </motion.div>
          </div>
        ) : (
          <DemandCard
            wish={list.wishes[demandIndex]}
            image={images[demandIndex]}
            gender={list.fromGender}
            n={demandIndex + 1}
            total={list.wishes.length}
            reduced={Boolean(reduced)}
          />
        )}
      </Deck>
    </>
  );
}

function DemandCard({
  wish,
  image,
  gender,
  n,
  total,
  reduced,
}: {
  wish: Wishlist["wishes"][number];
  image?: string;
  gender: "f" | "m";
  n: number;
  total: number;
  reduced: boolean;
}) {
  const gift = linkForWish(wish);
  const entrance = ENTRANCE[wish.reaction] ?? ENTRANCE.request;

  return (
    <div className="text-center">
      <motion.p
        className="font-sans text-[0.6rem] uppercase tracking-[0.34em] text-[var(--gold)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        Demand {n} of {total}
      </motion.p>

      <motion.div
        className="mt-3 flex justify-center"
        initial={reduced ? { opacity: 0 } : entrance.from}
        animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        transition={reduced ? { duration: 0.2 } : entrance.spring}
      >
        <ReactionCharacter reaction={wish.reaction} gender={gender} size={230} />
      </motion.div>

      {/* Speech bubble — the demand is being said, not narrated */}
      <motion.div
        className="relative mx-auto mt-5 max-w-sm rounded-3xl border-2 border-[var(--maroon)]/15 bg-[var(--ivory-deep)]/80 px-6 py-5"
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 15, delay: 0.28 }}
      >
        <span
          aria-hidden
          className="absolute -top-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-[var(--maroon)]/15 bg-[var(--ivory-deep)]"
        />
        <p className="font-display text-2xl font-light leading-snug text-[var(--maroon)] sm:text-3xl">
          {wish.text}
        </p>
      </motion.div>

      {image && (
        <motion.div
          className="mx-auto mt-4 overflow-hidden rounded-2xl"
          style={{
            aspectRatio: `${wish.image?.w ?? 4} / ${wish.image?.h ?? 3}`,
            width: `min(74%, calc(22vh * ${(wish.image?.w ?? 4) / (wish.image?.h ?? 3)}))`,
          }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.42, ease: EASE }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={wish.text} className="h-full w-full object-cover" decoding="async" />
        </motion.div>
      )}

      {gift && (
        <motion.a
          href={gift.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="pointer-events-auto mt-5 inline-block rounded-full bg-[var(--maroon)] px-7 py-3 font-sans text-[0.78rem] tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.55 }}
        >
          Get this one →
        </motion.a>
      )}
    </div>
  );
}
