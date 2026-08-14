"use client";

import { useState } from "react";
import type { Reaction } from "@/lib/wishlist";
import { ReactionFallback } from "./ReactionFallback";

/**
 * The six reactions.
 *
 * Uses the illustrated characters from /public/characters when they are
 * present, and silently falls back to the drawn SVG version if a file is
 * missing or fails to load. That keeps the page working whether or not the
 * art has been added yet, and means one missing file never leaves a broken
 * image icon in the middle of someone's wishlist.
 */

const ANIMATION: Record<Reaction, string> = {
  request: "tz-sway",
  beg: "tz-plead",
  mercy: "tz-plead",
  threat: "tz-shake",
  show: "tz-pop",
  celebrate: "tz-pop",
};

/**
 * Tries WebP, then PNG, then gives up and draws the figure.
 *
 * Both formats are attempted because the art arrives as PNG but ought to end
 * up as WebP — six characters render on a single wishlist, and PNGs at half a
 * megabyte each would put several megabytes on a phone. Preferring WebP means
 * converting the files later is the only step: nothing in the code changes,
 * and each character upgrades itself the moment its .webp appears.
 */
type Source = "webp" | "png" | "drawn";

const NEXT_SOURCE: Record<Exclude<Source, "drawn">, Source> = {
  webp: "png",
  png: "drawn",
};

export function ReactionCharacter({
  reaction,
  gender,
  size = 200,
}: {
  reaction: Reaction;
  gender: "f" | "m";
  size?: number;
}) {
  const [source, setSource] = useState<Source>("webp");

  return (
    <div
      className="relative inline-flex items-end justify-center"
      style={{ width: size, height: size }}
    >
      {/* Tinted disc, so a cut-out figure never floats on flat white */}
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          inset: "10% 8% 12%",
          background:
            "radial-gradient(circle at 50% 45%, rgba(233,168,80,0.26), rgba(233,168,80,0.05) 70%)",
        }}
      />
      {/* Contact shadow, kept in CSS so it stays editable */}
      <div
        aria-hidden
        className="absolute rounded-[50%]"
        style={{
          bottom: "7%",
          left: "26%",
          width: "48%",
          height: "4.5%",
          background: "rgba(110,27,36,0.18)",
          filter: "blur(5px)",
        }}
      />

      {source === "drawn" ? (
        <ReactionFallback reaction={reaction} gender={gender} size={size} />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={source}
          src={`/characters/${reaction}-${gender}.${source}`}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setSource(NEXT_SOURCE[source])}
          className={`relative h-full w-full object-contain ${ANIMATION[reaction]}`}
        />
      )}
    </div>
  );
}

/**
 * The two-person scenes — tying the rakhi, and touching feet for a blessing.
 * These are illustrations rather than reactions: a single wish cannot be
 * represented by two people, so they belong at the top and bottom of a page.
 */
export function RakhiScene({
  scene,
  className = "",
  width = 420,
}: {
  scene: "tying" | "blessing";
  className?: string;
  width?: number;
}) {
  const [source, setSource] = useState<Source>("webp");
  // No drawn stand-in for the two-person scenes — they are decoration, so if
  // neither file is there the section simply reads without an illustration.
  if (source === "drawn") return null;

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      key={source}
      src={`/characters/scene-${scene}.${source}`}
      alt=""
      width={width}
      height={Math.round(width * 0.68)}
      loading="lazy"
      decoding="async"
      onError={() => setSource(NEXT_SOURCE[source])}
      className={`h-auto w-full max-w-full object-contain ${className}`}
      style={{ maxWidth: width }}
    />
  );
}
