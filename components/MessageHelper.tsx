"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { MESSAGE_GROUPS, fillMessage } from "@/lib/messages";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Prewritten openings, offered underneath the message box.
 *
 * Closed by default: someone who already knows what to say should not have to
 * scroll past a wall of suggestions to say it. It only opens for the person
 * who is stuck, which is the person it is for.
 *
 * Picking one never overwrites what is already in the box — it appends. The
 * whole point is to unblock someone, and deleting the two lines they had
 * managed to write would do the opposite.
 */
export function MessageHelper({
  to,
  from,
  onPick,
  hasText,
}: {
  to: string;
  from: string;
  onPick: (text: string) => void;
  hasText: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (template: string) => {
    onPick(fillMessage(template, to, from));
    setPicked(template);
    window.setTimeout(() => setPicked(null), 1800);
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="font-sans text-[0.72rem] text-[var(--maroon-soft)] underline-offset-4 transition hover:underline"
      >
        {open ? "Hide suggestions" : "Not sure what to write? →"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-2xl border border-[var(--ivory-shadow)] bg-[var(--ivory)]/70 p-4">
              {/* which kind */}
              <div className="flex flex-wrap gap-1.5">
                {MESSAGE_GROUPS.map((g, i) => (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => setGroup(i)}
                    aria-pressed={group === i}
                    className={`rounded-full border px-3.5 py-1.5 font-sans text-[0.68rem] transition ${
                      group === i
                        ? "border-[var(--gold)] bg-[var(--ivory-deep)] text-[var(--maroon)]"
                        : "border-[var(--ivory-shadow)] text-[var(--muted)] hover:border-[var(--gold)]/60"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <p className="mt-3 font-sans text-[0.64rem] text-[var(--muted)]">
                {MESSAGE_GROUPS[group].hint}
                {hasText && " · adds below what you have written"}
              </p>

              <div className="mt-3 space-y-2">
                {MESSAGE_GROUPS[group].messages.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => choose(m)}
                    className="block w-full rounded-xl border border-[var(--ivory-shadow)] bg-[var(--ivory-deep)]/35 px-4 py-3 text-left font-display text-[1.02rem] italic leading-relaxed text-[var(--ink)] transition hover:border-[var(--gold)] hover:bg-[var(--ivory-deep)]/70"
                  >
                    {picked === m ? (
                      <span className="font-sans not-italic text-[0.8rem] text-[var(--maroon)]">
                        Added ↑
                      </span>
                    ) : (
                      fillMessage(m, to, from)
                    )}
                  </button>
                ))}
              </div>

              <p className="mt-3 font-sans text-[0.62rem] leading-relaxed text-[var(--muted)]">
                Change it afterwards. The bit only you would know is the bit
                they will read twice.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
