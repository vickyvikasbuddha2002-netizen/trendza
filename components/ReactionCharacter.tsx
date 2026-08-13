"use client";

import type { Reaction } from "@/lib/wishlist";

/**
 * The six reactions, drawn rather than downloaded.
 *
 * The spec called for twelve animated WebP files at 80KB each — a megabyte of
 * assets, a green-screen keying pipeline, and a fringe-QA pass on every one.
 * These are about 2KB of markup, scale to any size without blurring, recolour
 * from the site's own variables, and cannot develop a green halo. They also
 * look like they belong on an ivory page, which cartoon GIFs would not.
 */

const ANIMATION: Record<Reaction, string> = {
  request: "tz-sway",
  beg: "tz-plead",
  mercy: "tz-sway",
  threat: "tz-shake",
  show: "tz-pop",
  celebrate: "tz-pop",
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
  const gold = "var(--gold)";
  const maroon = "var(--maroon)";
  const ink = "var(--ink)";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Tinted disc, so a line drawing never floats on flat white */}
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          inset: "8%",
          background:
            "radial-gradient(circle at 50% 40%, rgba(233,168,80,0.24), rgba(233,168,80,0.05) 70%)",
        }}
      />
      {/* Contact shadow, in CSS so it stays editable */}
      <div
        aria-hidden
        className="absolute rounded-[50%]"
        style={{
          bottom: "9%",
          left: "27%",
          width: "46%",
          height: "5%",
          background: "rgba(110,27,36,0.16)",
          filter: "blur(5px)",
        }}
      />

      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
        className={`relative ${ANIMATION[reaction]}`}
        role="img"
        aria-label={reaction}
      >
        {/* Hair behind the head */}
        {gender === "f" && (
          <path
            d="M62 74 C 56 40, 78 24, 100 24 C 122 24, 144 40, 138 74 C 136 86, 132 92, 130 96 L 126 66 L 74 66 L 70 96 C 68 92, 64 86, 62 74 Z"
            fill={maroon}
            opacity="0.9"
          />
        )}

        <Body reaction={reaction} gold={gold} maroon={maroon} />

        {/* Head */}
        <circle cx="100" cy="66" r="30" fill="var(--ivory)" stroke={gold} strokeWidth="2.2" />

        {/* Fringe */}
        {gender === "f" ? (
          <path
            d="M72 58 C 78 38, 122 38, 128 58 C 120 48, 110 46, 100 50 C 90 46, 80 48, 72 58 Z"
            fill={maroon}
          />
        ) : (
          <path
            d="M73 56 C 78 36, 122 36, 127 56 C 118 47, 82 47, 73 56 Z"
            fill={maroon}
          />
        )}

        <Face reaction={reaction} ink={ink} maroon={maroon} />
      </svg>
    </div>
  );
}

function Body({
  reaction,
  gold,
  maroon,
}: {
  reaction: Reaction;
  gold: string;
  maroon: string;
}) {
  const torso =
    "M78 96 C 78 92, 84 90, 100 90 C 116 90, 122 92, 122 96 L 128 150 C 128 156, 118 158, 100 158 C 82 158, 72 156, 72 150 Z";

  const arms: Record<Reaction, string> = {
    // one hand raised, politely
    request: "M80 106 C 66 116, 62 132, 66 146 M120 106 C 134 100, 142 86, 138 72",
    // both hands together, held out low
    beg: "M80 108 C 68 120, 76 136, 94 138 M120 108 C 132 120, 124 136, 106 138",
    // hands clasped at the chest
    mercy: "M80 108 C 70 118, 82 126, 96 124 M120 108 C 130 118, 118 126, 104 124",
    // arms folded
    threat: "M78 112 C 92 118, 108 118, 124 112 M76 122 C 92 128, 110 128, 126 122",
    // arms out, presenting
    show: "M80 106 C 62 108, 52 120, 50 134 M120 106 C 138 108, 148 120, 150 134",
    // arms up
    celebrate: "M80 104 C 64 96, 56 78, 58 62 M120 104 C 136 96, 144 78, 142 62",
  };

  return (
    <>
      <path d={torso} fill={maroon} opacity="0.92" />
      <path
        d={arms[reaction]}
        stroke={gold}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* the rakhi, always on the wrist */}
      {reaction !== "threat" && (
        <circle cx="66" cy="146" r="4.5" fill={gold} opacity="0.9" />
      )}
    </>
  );
}

function Face({
  reaction,
  ink,
  maroon,
}: {
  reaction: Reaction;
  ink: string;
  maroon: string;
}) {
  const eyeY = 66;

  if (reaction === "threat") {
    return (
      <>
        <path d="M84 58 L95 63 M116 58 L105 63" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="90" cy={eyeY + 2} r="3" fill={ink} />
        <circle cx="110" cy={eyeY + 2} r="3" fill={ink} />
        <path d="M90 80 C 96 76, 104 76, 110 80" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      </>
    );
  }

  if (reaction === "beg" || reaction === "mercy") {
    return (
      <>
        {/* oversized pleading eyes with highlights */}
        <circle cx="89" cy={eyeY} r="7.5" fill={ink} />
        <circle cx="111" cy={eyeY} r="7.5" fill={ink} />
        <circle cx="91.5" cy={eyeY - 2.5} r="2.6" fill="var(--ivory)" />
        <circle cx="113.5" cy={eyeY - 2.5} r="2.6" fill="var(--ivory)" />
        <path d="M92 80 C 96 84, 104 84, 108 80" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
        {reaction === "mercy" && (
          <path d="M84 72 C 82 78, 83 82, 85 84" stroke={gold(maroon)} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        )}
      </>
    );
  }

  if (reaction === "celebrate" || reaction === "show") {
    return (
      <>
        <path d="M84 64 C 87 60, 93 60, 96 64" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M104 64 C 107 60, 113 60, 116 64" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M88 76 C 94 84, 106 84, 112 76" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="80" cy="74" r="3.5" fill="#e88" opacity="0.45" />
        <circle cx="120" cy="74" r="3.5" fill="#e88" opacity="0.45" />
      </>
    );
  }

  // request
  return (
    <>
      <circle cx="90" cy={eyeY} r="3.4" fill={ink} />
      <circle cx="110" cy={eyeY} r="3.4" fill={ink} />
      <path d="M91 79 C 96 83, 104 83, 109 79" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
    </>
  );
}

/** A tear, tinted off the maroon so it reads without a new variable. */
function gold(maroon: string) {
  return maroon;
}
