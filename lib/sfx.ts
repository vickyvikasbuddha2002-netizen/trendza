/**
 * One-shot sounds for the decks, synthesised rather than downloaded.
 *
 * Same reasoning as the ambient score: nothing to fetch, nothing to licence,
 * and a card can make a noise the instant it is tapped rather than waiting on
 * a network round trip.
 *
 * The context is built lazily on the first tap, which is also the only moment
 * a browser will allow it, and unlocked with a silent sample because iOS
 * ignores a context that has never played anything.
 */

let ctx: AudioContext | null = null;
let muted = false;

function ensure(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof window === "undefined") return null;

  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  ctx = new Ctor();

  try {
    const unlock = ctx.createBufferSource();
    unlock.buffer = ctx.createBuffer(1, 1, 22050);
    unlock.connect(ctx.destination);
    unlock.start(0);
  } catch {
    /* older engines */
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});

  return ctx;
}

export function setSfxMuted(value: boolean) {
  muted = value;
}

export function isSfxMuted() {
  return muted;
}

interface ToneOptions {
  freq: number;
  type?: OscillatorType;
  duration?: number;
  peak?: number;
  /** Slides to this frequency over the note, for thuds and swoops. */
  glideTo?: number;
  delay?: number;
}

function tone({
  freq,
  type = "triangle",
  duration = 0.28,
  peak = 0.16,
  glideTo,
  delay = 0,
}: ToneOptions) {
  const c = ensure();
  if (!c || muted) return;

  const at = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, at + duration);

  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(at);
  osc.stop(at + duration + 0.05);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

/** Advancing a card. Bright, short, out of the way. */
export function sfxTap() {
  tone({ freq: 660, duration: 0.16, peak: 0.1 });
}

/** Going back. The same note, lower, so direction is audible. */
export function sfxBack() {
  tone({ freq: 420, duration: 0.14, peak: 0.07 });
}

/** A demand landing. */
export function sfxLand() {
  tone({ freq: 523.25, duration: 0.26, peak: 0.13 });
  tone({ freq: 783.99, duration: 0.3, peak: 0.08, delay: 0.05 });
}

/** The threatening one. Low, blunt, slightly menacing. */
export function sfxThud() {
  tone({ freq: 160, type: "sine", duration: 0.42, peak: 0.26, glideTo: 55 });
}

/** Reaching the end. */
export function sfxFinale() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    tone({ freq: f, duration: 0.5, peak: 0.11, delay: i * 0.085 }),
  );
}
