"use client";

import { motion } from "framer-motion";
import { CornerMandala, Glints, Toran } from "./Ornaments";

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

export function Atmosphere({
  intensity = 1,
  garland = true,
}: {
  intensity?: number;
  garland?: boolean;
}) {
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

      {/* the toran across the top */}
      {garland && <Toran />}

      {/* turning corner mandalas, hung off the edge so only a quadrant shows */}
      <motion.div
        className="absolute -left-[13%] -top-[10%] h-64 w-64 sm:h-96 sm:w-96"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <CornerMandala className="h-full w-full" />
      </motion.div>
      <motion.div
        className="absolute -bottom-[12%] -right-[13%] h-64 w-64 sm:h-96 sm:w-96"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 2.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <CornerMandala className="h-full w-full" flip />
      </motion.div>

      {/* glints catching the light */}
      <Glints count={11} seed={17} />

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
