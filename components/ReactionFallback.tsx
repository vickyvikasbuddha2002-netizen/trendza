"use client";

import type { Reaction } from "@/lib/wishlist";

/**
 * The drawn stand-in, used only when an illustrated character file is missing
 * or fails to load. Keeps a wishlist readable rather than leaving a broken
 * image icon where a face should be.
 */
export function ReactionFallback({
  reaction,
  gender,
  size,
}: {
  reaction: Reaction;
  gender: "f" | "m";
  size: number;
}) {
  const gold = "var(--gold)";
  const maroon = "var(--maroon)";
  const ink = "var(--ink)";

  const arms: Record<Reaction, string> = {
    request: "M80 106 C 66 116, 62 132, 66 146 M120 106 C 134 100, 142 86, 138 72",
    beg: "M80 108 C 68 120, 76 136, 94 138 M120 108 C 132 120, 124 136, 106 138",
    mercy: "M80 108 C 70 118, 82 126, 96 124 M120 108 C 130 118, 118 126, 104 124",
    threat: "M78 112 C 92 118, 108 118, 124 112 M76 122 C 92 128, 110 128, 126 122",
    show: "M80 106 C 62 108, 52 120, 50 134 M120 106 C 138 108, 148 120, 150 134",
    celebrate: "M80 104 C 64 96, 56 78, 58 62 M120 104 C 136 96, 144 78, 142 62",
  };

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      className="relative"
      role="img"
      aria-label={reaction}
    >
      {gender === "f" && (
        <path
          d="M62 74 C 56 40, 78 24, 100 24 C 122 24, 144 40, 138 74 C 136 86, 132 92, 130 96 L 126 66 L 74 66 L 70 96 C 68 92, 64 86, 62 74 Z"
          fill={maroon}
          opacity="0.9"
        />
      )}

      <path
        d="M78 96 C 78 92, 84 90, 100 90 C 116 90, 122 92, 122 96 L 128 150 C 128 156, 118 158, 100 158 C 82 158, 72 156, 72 150 Z"
        fill={maroon}
        opacity="0.92"
      />
      <path
        d={arms[reaction]}
        stroke={gold}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />

      <circle cx="100" cy="66" r="30" fill="var(--ivory)" stroke={gold} strokeWidth="2.2" />

      {gender === "f" ? (
        <path
          d="M72 58 C 78 38, 122 38, 128 58 C 120 48, 110 46, 100 50 C 90 46, 80 48, 72 58 Z"
          fill={maroon}
        />
      ) : (
        <path d="M73 56 C 78 36, 122 36, 127 56 C 118 47, 82 47, 73 56 Z" fill={maroon} />
      )}

      {reaction === "threat" ? (
        <>
          <path
            d="M84 58 L95 63 M116 58 L105 63"
            stroke={ink}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="90" cy="68" r="3" fill={ink} />
          <circle cx="110" cy="68" r="3" fill={ink} />
          <path
            d="M90 80 C 96 76, 104 76, 110 80"
            stroke={ink}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </>
      ) : reaction === "beg" || reaction === "mercy" ? (
        <>
          <circle cx="89" cy="66" r="7.5" fill={ink} />
          <circle cx="111" cy="66" r="7.5" fill={ink} />
          <circle cx="91.5" cy="63.5" r="2.6" fill="var(--ivory)" />
          <circle cx="113.5" cy="63.5" r="2.6" fill="var(--ivory)" />
          <path
            d="M92 80 C 96 84, 104 84, 108 80"
            stroke={ink}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="90" cy="66" r="3.4" fill={ink} />
          <circle cx="110" cy="66" r="3.4" fill={ink} />
          <path
            d="M91 79 C 96 83, 104 83, 109 79"
            stroke={ink}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
