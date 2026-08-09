/**
 * Generative ambient score, synthesised in the browser.
 *
 * There is no audio file: nothing to download, nothing to licence, and
 * no loop seam to hear. A warm detuned drone sits underneath, and single
 * notes from Raag Bhoopali (the major pentatonic — S R G P D) fall over
 * it at irregular intervals through a synthetic reverb.
 *
 * Browsers refuse to start audio without a user gesture, so `start()`
 * must be called from inside a click/tap handler. On the wish page that
 * gesture is the tap that unties the thread.
 */

// C4-rooted Bhoopali across two octaves.
const SCALE_HZ = [
  261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0,
];

const DRONE_HZ = [130.81, 196.0, 261.63]; // root, fifth, octave

export class AmbientScore {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  private timer: number | null = null;
  private muted = false;
  private disposed = false;

  get isRunning() {
    return this.ctx !== null;
  }

  /** Must be called from a user gesture. Safe to call more than once. */
  async start(muted: boolean) {
    if (this.ctx || this.disposed) return;
    this.muted = muted;

    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return; // No Web Audio; the page simply stays silent.

    const ctx = new Ctor();
    this.ctx = ctx;

    // Some browsers hand back a suspended context even from a gesture.
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        /* stays silent, page still works */
      }
    }

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = buildImpulse(ctx, 3.2, 2.6);
    const reverbOut = ctx.createGain();
    reverbOut.gain.value = 0.42;
    this.reverb.connect(reverbOut);
    reverbOut.connect(master);

    this.buildDrone(ctx, master);
    this.scheduleNotes();

    // Long fade so it arrives rather than switches on.
    this.applyVolume(6);
  }

  private buildDrone(ctx: AudioContext, master: GainNode) {
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.055;
    this.droneGain = droneGain;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 620;
    filter.Q.value = 0.7;

    // Slow sweep across the drone's timbre so it never sits still.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 260;
    lfo.connect(lfoDepth);
    lfoDepth.connect(filter.frequency);
    lfo.start();
    this.lfo = lfo;

    for (const hz of DRONE_HZ) {
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = hz;
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start();
        this.oscillators.push(osc);
      }
    }

    filter.connect(droneGain);
    droneGain.connect(master);
  }

  private scheduleNotes() {
    const tick = () => {
      if (!this.ctx || this.disposed) return;
      this.pluck();
      // Irregular spacing — an even pulse would read as a ringtone.
      const next = 2200 + Math.random() * 3400;
      this.timer = window.setTimeout(tick, next);
    };
    this.timer = window.setTimeout(tick, 1200);
  }

  private pluck() {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;

    const now = ctx.currentTime;
    const hz = SCALE_HZ[Math.floor(Math.random() * SCALE_HZ.length)];

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = hz;

    const body = ctx.createBiquadFilter();
    body.type = "lowpass";
    body.frequency.value = hz * 4.5;

    const env = ctx.createGain();
    const peak = 0.16 + Math.random() * 0.07;
    const decay = 2.4 + Math.random() * 1.8;

    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(peak, now + 0.035);
    env.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(body);
    body.connect(env);
    env.connect(master);
    if (this.reverb) env.connect(this.reverb);

    osc.start(now);
    osc.stop(now + decay + 0.15);
    osc.onended = () => {
      osc.disconnect();
      body.disconnect();
      env.disconnect();
    };
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyVolume(muted ? 0.4 : 1.2);
  }

  private applyVolume(seconds: number) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const target = this.muted ? 0.0001 : 0.9;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
    master.gain.exponentialRampToValueAtTime(target, now + seconds);
  }

  dispose() {
    this.disposed = true;
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    for (const osc of this.oscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        /* already stopped */
      }
    }
    this.oscillators = [];
    try {
      this.lfo?.stop();
      this.lfo?.disconnect();
    } catch {
      /* already stopped */
    }
    this.lfo = null;
    this.droneGain = null;
    this.master = null;
    this.reverb = null;
    const ctx = this.ctx;
    this.ctx = null;
    void ctx?.close().catch(() => {});
  }
}

/** Exponentially decaying noise — a cheap, convincing hall. */
function buildImpulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * seconds);
  const impulse = ctx.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

export const MUTE_STORAGE_KEY = "tz_muted";
