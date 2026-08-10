"use client";

import { useMemo } from "react";

/**
 * Deterministic pseudo-random, seeded per component.
 *
 * Math.random() here would produce different petal positions on the server
 * and the client, and React would throw a hydration mismatch. A fixed seed
 * gives the same scatter in both places.
 */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Marigold petals on three depth layers. The layers differ in size, speed
 * and opacity, which is what reads as parallax without any scroll maths.
 */
export function Petals({ count = 18, seed = 7 }: { count?: number; seed?: number }) {
  const petals = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, (_, i) => {
      const depth = i % 3; // 0 = far, 2 = near
      const scale = [0.55, 0.8, 1.15][depth];
      return {
        key: i,
        left: rand() * 100,
        size: (9 + rand() * 7) * scale,
        duration: (26 - depth * 5) + rand() * 12,
        delay: -rand() * 30,
        drift: (rand() * 180 - 90) * (depth + 1) * 0.5,
        spin: 180 + rand() * 420,
        opacity: [0.28, 0.45, 0.62][depth],
        hue: rand() > 0.55 ? "var(--gold-light)" : "#e8a13c",
      };
    });
  }, [count, seed]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {petals.map((p) => (
        <span
          key={p.key}
          className="tz-petal absolute top-0 block"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.62,
              background: p.hue,
              borderRadius: "60% 40% 55% 45% / 70% 65% 35% 30%",
              "--petal-duration": `${p.duration}s`,
              "--petal-delay": `${p.delay}s`,
              "--petal-drift": `${p.drift}px`,
              "--petal-spin": `${p.spin}deg`,
              "--petal-opacity": p.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * Slow saffron and rose light moving under the ivory, so the background is
 * never a flat colour. Sits behind everything at z-0.
 */
/**
 * Slow saffron and rose light moving under the ivory, so the background is
 * never a flat colour.
 *
 * Deliberately no `filter: blur()`. These used to carry a 90-110px blur,
 * which on a mid-range Android meant the GPU re-rasterising three
 * viewport-sized layers every frame — the single biggest cause of jank on
 * the whole site. A radial gradient that fades to zero is already soft;
 * the blur was buying nothing and costing everything.
 */
export function Bloom() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="tz-bloom absolute -left-[25%] -top-[30%] h-[95vh] w-[95vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(233,168,80,0.38) 0%, rgba(233,168,80,0.16) 38%, rgba(233,168,80,0) 70%)",
        }}
      />
      <div
        className="tz-bloom-alt absolute -right-[22%] top-[4%] h-[88vh] w-[88vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(214,120,130,0.30) 0%, rgba(214,120,130,0.13) 38%, rgba(214,120,130,0) 70%)",
        }}
      />
      <div
        className="tz-bloom absolute bottom-[-35%] left-[18%] hidden h-[90vh] w-[90vh] rounded-full sm:block"
        style={{
          animationDelay: "-11s",
          background:
            "radial-gradient(circle, rgba(201,162,39,0.26) 0%, rgba(201,162,39,0.11) 40%, rgba(201,162,39,0) 72%)",
        }}
      />
    </div>
  );
}

/** A hairline of gold with a highlight travelling along it. */
export function ThreadRule({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`relative h-px w-full overflow-hidden opacity-70 ${className}`}
    >
      <div className="tz-hairline absolute inset-0" />
      <div
        className="tz-shimmer absolute inset-y-0 w-1/4"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent)",
        }}
      />
    </div>
  );
}
