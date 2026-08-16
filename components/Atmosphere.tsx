"use client";

import { motion } from "framer-motion";

/**
 * The layer that makes a page feel like paper rather than a screen.
 *
 * Flat ivory reads as a blank div no matter how good the type on it is. Four
 * things fix that, cheaply: thin gold ornament in the corners so the frame is
 * decorated rather than empty, a vignette so the light falls off at the edges,
 * a grain so the surface has texture, and a slow warm wash underneath so it is
 * never the same colour twice.
 *
 * All of it is drawn — no images — and none of it animates position, so it
 * costs almost nothing on a phone.
 */

function CornerMandala({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      stroke="var(--gold)"
      strokeWidth="1"
      aria-hidden
    >
      {/* concentric petals radiating from the corner */}
      {[34, 58, 82, 106].map((r, ring) =>
        Array.from({ length: 6 }, (_, i) => {
          const a = (i * 90) / 5;
          const rad = (a * Math.PI) / 180;
          return (
            <ellipse
              key={`${ring}-${i}`}
              cx={Math.cos(rad) * r}
              cy={Math.sin(rad) * r}
              rx="11"
              ry="4.5"
              opacity={0.5 - ring * 0.09}
              transform={`rotate(${a} ${Math.cos(rad) * r} ${Math.sin(rad) * r})`}
            />
          );
        }),
      )}
      {[26, 50, 74, 98].map((r, i) => (
        <path
          key={r}
          d={`M ${r} 0 A ${r} ${r} 0 0 1 0 ${r}`}
          opacity={0.34 - i * 0.06}
          strokeDasharray={i % 2 ? "3 7" : undefined}
        />
      ))}
    </svg>
  );
}

export function Atmosphere({ intensity = 1 }: { intensity?: number }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* warm wash, breathing slowly */}
      <div
        className="tz-bloom absolute -left-[28%] -top-[32%] h-[105vh] w-[105vh] rounded-full"
        style={{
          opacity: intensity,
          background:
            "radial-gradient(circle, rgba(233,168,80,0.40) 0%, rgba(233,168,80,0.15) 40%, rgba(233,168,80,0) 72%)",
        }}
      />
      <div
        className="tz-bloom-alt absolute -right-[26%] top-[6%] h-[95vh] w-[95vh] rounded-full"
        style={{
          opacity: intensity,
          background:
            "radial-gradient(circle, rgba(214,120,130,0.32) 0%, rgba(214,120,130,0.12) 40%, rgba(214,120,130,0) 72%)",
        }}
      />

      {/* corner ornament */}
      <motion.div
        className="absolute left-0 top-0 h-40 w-40 sm:h-56 sm:w-56"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 0.85, scale: 1 }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <CornerMandala className="h-full w-full" />
      </motion.div>
      <motion.div
        className="absolute bottom-0 right-0 h-40 w-40 rotate-180 sm:h-56 sm:w-56"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 0.85, scale: 1 }}
        transition={{ duration: 2.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <CornerMandala className="h-full w-full" />
      </motion.div>

      {/* light falls off at the edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(253,249,243,0) 42%, rgba(150,110,70,0.10) 78%, rgba(110,70,40,0.20) 100%)",
        }}
      />

      {/* grain, so the surface is paper rather than a flat fill */}
      <div className="tz-grain absolute inset-0" />
    </div>
  );
}
