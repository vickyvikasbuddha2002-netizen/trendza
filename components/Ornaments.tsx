"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * The festival decoration: turning corner mandalas, a marigold toran across
 * the top, drifting glints, and a lit diya.
 *
 * All drawn — no images — and everything animates transform or opacity only,
 * so a page carrying six of these still composites on the GPU.
 */

/* ── Corner mandala ──────────────────────────────────────────────
   Two rings turning against each other, with a breathing petal ring
   between them. Static ornament reads as wallpaper; counter-rotation
   reads as something alive without ever demanding attention. */
export function CornerMandala({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <div className={`relative ${className}`} style={flip ? { transform: "rotate(180deg)" } : undefined}>
      {/* outer ring, slow */}
      <svg viewBox="-120 -120 240 240" className="tz-turn absolute inset-0 h-full w-full" fill="none">
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-96"
            rx="7"
            ry="20"
            stroke="var(--gold)"
            strokeWidth="1"
            opacity="0.32"
            transform={`rotate(${i * 22.5})`}
          />
        ))}
        <circle r="112" stroke="var(--gold)" strokeWidth="0.8" opacity="0.2" strokeDasharray="2 9" />
      </svg>

      {/* middle ring, breathing */}
      <svg viewBox="-120 -120 240 240" className="tz-breathe-ring absolute inset-0 h-full w-full" fill="none">
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-58"
            rx="13"
            ry="27"
            stroke="var(--gold)"
            strokeWidth="1.2"
            fill="var(--gold)"
            fillOpacity="0.05"
            opacity="0.5"
            transform={`rotate(${i * 45})`}
          />
        ))}
      </svg>

      {/* inner ring, counter-turning */}
      <svg viewBox="-120 -120 240 240" className="tz-turn-back absolute inset-0 h-full w-full" fill="none">
        {Array.from({ length: 6 }, (_, i) => (
          <path
            key={i}
            d="M0 -34 C 9 -22, 9 -10, 0 0 C -9 -10, -9 -22, 0 -34 Z"
            stroke="var(--gold)"
            strokeWidth="1.1"
            fill="var(--gold)"
            fillOpacity="0.07"
            opacity="0.6"
            transform={`rotate(${i * 60})`}
          />
        ))}
        <circle r="7" fill="var(--gold)" opacity="0.5" />
      </svg>
    </div>
  );
}

/* ── Toran ───────────────────────────────────────────────────────
   The marigold-and-leaf string hung across a doorway at every Indian
   festival. Instantly reads as an occasion, and swaying gently it does
   more for the page than any amount of extra type would. */
export function Toran() {
  const marigolds = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => {
        const t = i / 14;
        // a shallow catenary, so the string hangs rather than sits straight
        const dip = Math.sin(t * Math.PI) * 26;
        return { left: `${t * 100}%`, top: 8 + dip, delay: i * 0.13, big: i % 2 === 0 };
      }),
    [],
  );

  return (
    <div aria-hidden className="tz-garland pointer-events-none absolute inset-x-0 top-0 z-10 h-24">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-14 w-full">
        <path d="M0 2 Q 50 30 100 2" stroke="var(--gold)" strokeWidth="0.4" fill="none" opacity="0.55" />
      </svg>

      {marigolds.map((m, i) => (
        <motion.div
          key={i}
          className="absolute -translate-x-1/2"
          style={{ left: m.left, top: m.top }}
          initial={{ opacity: 0, y: -14, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: m.delay, ease: [0.22, 1, 0.36, 1] }}
        >
          {m.big ? (
            <svg width="26" height="26" viewBox="0 0 24 24">
              {Array.from({ length: 8 }, (_, p) => (
                <ellipse
                  key={p}
                  cx="12"
                  cy="6.5"
                  rx="3"
                  ry="5"
                  fill="#e8a13c"
                  opacity="0.9"
                  transform={`rotate(${p * 45} 12 12)`}
                />
              ))}
              <circle cx="12" cy="12" r="3" fill="#c9781f" />
            </svg>
          ) : (
            <svg width="17" height="24" viewBox="0 0 16 24">
              <path d="M8 2 C 14 8, 14 16, 8 22 C 2 16, 2 8, 8 2 Z" fill="#4b7f52" opacity="0.85" />
              <path d="M8 3 V 21" stroke="#2f5c37" strokeWidth="0.8" opacity="0.7" />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ── Glints ──────────────────────────────────────────────────────
   Four-point stars catching the light. Deterministic positions so the
   server and client render the same thing. */
export function Glints({ count = 12, seed = 3 }: { count?: number; seed?: number }) {
  const stars = useMemo(() => {
    let s = seed;
    const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      left: rand() * 100,
      top: rand() * 100,
      size: 6 + rand() * 12,
      delay: rand() * 6,
      dur: 3.5 + rand() * 3.5,
    }));
  }, [count, seed]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {stars.map((g) => (
        <svg
          key={g.key}
          className="tz-twinkle absolute"
          viewBox="0 0 24 24"
          style={
            {
              left: `${g.left}%`,
              top: `${g.top}%`,
              width: g.size,
              height: g.size,
              "--tw-delay": `${g.delay}s`,
              "--tw-dur": `${g.dur}s`,
            } as React.CSSProperties
          }
        >
          <path
            d="M12 0 C 13 8, 16 11, 24 12 C 16 13, 13 16, 12 24 C 11 16, 8 13, 0 12 C 8 11, 11 8, 12 0 Z"
            fill="var(--gold-light)"
          />
        </svg>
      ))}
    </div>
  );
}

/* ── Memory frame ────────────────────────────────────────────────
   A vine that grows around a photograph and flowers at the corners.
   The stroke draws itself first and the marigolds open after it arrives,
   so the frame is planted rather than pasted on. */
export function MemoryVine({ delay = 0.5 }: { delay?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute -inset-6 sm:-inset-9">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" fill="none">
        {[
          "M2 18 C 2 8, 8 2, 18 2",
          "M82 2 C 92 2, 98 8, 98 18",
          "M98 82 C 98 92, 92 98, 82 98",
          "M18 98 C 8 98, 2 92, 2 82",
        ].map((d, i) => (
          <motion.path
            key={d}
            d={d}
            stroke="var(--gold)"
            strokeWidth="0.6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, delay: delay + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </svg>

      {/* a marigold opening at each corner */}
      {[
        { c: "left-0 top-0", d: 0 },
        { c: "right-0 top-0", d: 0.12 },
        { c: "right-0 bottom-0", d: 0.24 },
        { c: "left-0 bottom-0", d: 0.36 },
      ].map((m) => (
        <motion.svg
          key={m.c}
          viewBox="0 0 24 24"
          className={`absolute h-6 w-6 sm:h-8 sm:w-8 ${m.c}`}
          initial={{ opacity: 0, scale: 0, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 12, delay: delay + 0.8 + m.d }}
        >
          {Array.from({ length: 8 }, (_, p) => (
            <ellipse
              key={p}
              cx="12"
              cy="6.5"
              rx="2.6"
              ry="4.6"
              fill="#e8a13c"
              opacity="0.85"
              transform={`rotate(${p * 45} 12 12)`}
            />
          ))}
          <circle cx="12" cy="12" r="2.6" fill="#c9781f" />
        </motion.svg>
      ))}
    </div>
  );
}

/* ── Playful corners ─────────────────────────────────────────────
   For the wishlist, which is a joke rather than a keepsake. Rakhis
   turning, gifts bobbing, confetti drifting — the same festival, told
   with a grin instead of a hush. */
export function PlayfulCorners() {
  const confetti = useMemo(() => {
    let s = 41;
    const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
    return Array.from({ length: 14 }, (_, i) => ({
      key: i,
      left: rand() * 100,
      size: 7 + rand() * 9,
      dur: 13 + rand() * 12,
      delay: -rand() * 20,
      drift: rand() * 120 - 60,
      spin: 240 + rand() * 400,
      colour: ["#e8a13c", "#c9a227", "#d67882", "#6e1b24"][Math.floor(rand() * 4)],
      round: rand() > 0.5,
    }));
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {/* a rakhi turning in each upper corner */}
      {[
        "left-[-9%] top-[-7%]",
        "right-[-9%] top-[-7%]",
      ].map((pos, i) => (
        <div key={pos} className={`absolute h-52 w-52 sm:h-72 sm:w-72 ${pos}`}>
          <svg
            viewBox="-60 -60 120 120"
            className={i === 0 ? "tz-turn h-full w-full" : "tz-turn-back h-full w-full"}
            fill="none"
          >
            {Array.from({ length: 10 }, (_, p) => (
              <ellipse
                key={p}
                cx="0"
                cy="-34"
                rx="7"
                ry="15"
                stroke="var(--gold)"
                strokeWidth="1.2"
                fill="var(--gold)"
                fillOpacity="0.07"
                opacity="0.5"
                transform={`rotate(${p * 36})`}
              />
            ))}
            <circle r="11" fill="var(--maroon)" opacity="0.55" />
            <circle r="17" stroke="var(--gold)" strokeWidth="1.2" opacity="0.5" />
          </svg>
        </div>
      ))}

      {/* confetti, falling on the petal keyframes already in the sheet */}
      {confetti.map((c) => (
        <span
          key={c.key}
          className="tz-petal absolute top-0 block"
          style={
            {
              left: `${c.left}%`,
              width: c.size,
              height: c.round ? c.size : c.size * 0.5,
              background: c.colour,
              borderRadius: c.round ? "50%" : "2px",
              "--petal-duration": `${c.dur}s`,
              "--petal-delay": `${c.delay}s`,
              "--petal-drift": `${c.drift}px`,
              "--petal-spin": `${c.spin}deg`,
              "--petal-opacity": 0.55,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ── Arch ────────────────────────────────────────────────────────
   The scalloped doorway of a haveli, drawn behind the hero. An arch is
   what makes a space feel ceremonial rather than merely decorated — it
   says you are standing at an entrance, which is exactly what a landing
   page is. Drawn as one path so it scales to any width without seams. */
export function Arch({ className = "" }: { className?: string }) {
  // eleven scallops across the top of the arch
  const scallops = Array.from({ length: 11 }, (_, i) => {
    const x = 6 + i * 8.8;
    return `Q ${x + 2.2} 16 ${x + 4.4} 22 Q ${x + 6.6} 16 ${x + 8.8} 22`;
  }).join(" ");

  return (
    <svg
      viewBox="0 0 100 120"
      preserveAspectRatio="none"
      className={className}
      fill="none"
      aria-hidden
    >
      <motion.path
        d={`M4 120 L4 40 Q 4 22 14 22 ${scallops} Q 96 22 96 40 L96 120`}
        stroke="var(--gold)"
        strokeWidth="0.55"
        vectorEffect="non-scaling-stroke"
        opacity="0.55"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.55 }}
        transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d={`M8 120 L8 42 Q 8 27 17 27 L83 27 Q 92 27 92 42 L92 120`}
        stroke="var(--gold)"
        strokeWidth="0.4"
        vectorEffect="non-scaling-stroke"
        strokeDasharray="1.5 3"
        opacity="0.35"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* a hanging bud at the crown */}
      <motion.g
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 1.2, delay: 2.2 }}
      >
        <line x1="50" y1="22" x2="50" y2="31" stroke="var(--gold)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
        <circle cx="50" cy="33" r="2.2" fill="var(--gold)" opacity="0.5" />
      </motion.g>
    </svg>
  );
}

/* ── Diya ────────────────────────────────────────────────────────
   A lit lamp. The flame leans and swells on mismatched timings so it
   never falls into an obvious loop. */
export function Diya({ size = 90 }: { size?: number }) {
  return (
    <div className="relative inline-block" style={{ width: size, height: size * 0.95 }} aria-hidden>
      <div
        className="tz-glowpulse absolute left-1/2 top-[6%] h-[62%] w-[62%] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,190,90,0.75), rgba(255,190,90,0) 70%)",
        }}
      />
      <svg viewBox="0 0 100 95" className="absolute inset-0 h-full w-full">
        <g className="tz-flame" style={{ transformOrigin: "50px 52px" }}>
          <path d="M50 14 C 58 30, 62 40, 56 49 C 52 55, 48 55, 44 49 C 38 40, 42 30, 50 14 Z" fill="#f5a623" />
          <path d="M50 26 C 55 36, 56 43, 52 48 C 49 51, 47 50, 46 47 C 44 42, 46 35, 50 26 Z" fill="#ffe08a" />
        </g>
        <path d="M18 58 C 26 82, 74 82, 82 58 Z" fill="var(--maroon)" />
        <ellipse cx="50" cy="58" rx="32" ry="8" fill="#8e3a42" />
        <ellipse cx="50" cy="57" rx="24" ry="5" fill="#4a1119" opacity="0.65" />
        <path d="M18 58 C 26 82, 74 82, 82 58" stroke="var(--gold)" strokeWidth="1.6" fill="none" opacity="0.75" />
      </svg>
    </div>
  );
}
