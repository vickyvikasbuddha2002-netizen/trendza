"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Reveals a line a word at a time.
 *
 * A whole sentence fading in is read all at once, the way a paragraph on a
 * poster is. Word by word forces the pace of someone speaking, which is what
 * these lines are — things a person could not say out loud and wrote down
 * instead. It is the difference between reading a message and being told one.
 *
 * Under `prefers-reduced-motion` the whole line simply appears.
 */
export function WordReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.09,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return (
      <motion.p
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay }}
      >
        {text}
      </motion.p>
    );
  }

  return (
    <motion.p
      className={className}
      initial="hidden"
      animate="shown"
      variants={{ shown: { transition: { delayChildren: delay, staggerChildren: stagger } } }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", opacity: 0 },
              shown: { y: "0%", opacity: 1 },
            }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.p>
  );
}
