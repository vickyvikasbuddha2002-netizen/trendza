"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Finger-drawn signature on a canvas.
 *
 * Pointer events rather than separate mouse/touch handlers, and
 * `touch-action: none` so dragging signs instead of scrolling the page.
 * Backed by a DPR-scaled bitmap or the stroke looks soft on phones.
 */
export function SignaturePad({
  onChange,
  label,
}: {
  onChange: (dataUrl: string | null) => void;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      // Resizing clears the bitmap, so this only runs while it is blank.
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#2a1f1c";
    };

    resize();
    const observer = new ResizeObserver(() => {
      if (!hasInk) resize();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [hasInk]);

  const pointOf = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pointOf(e);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const point = pointOf(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    last.current = point;

    if (!hasInk) setHasInk(true);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const canvas = canvasRef.current;
    if (canvas && hasInk) onChange(canvas.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="font-sans text-[0.68rem] uppercase tracking-[0.26em] text-[var(--muted)]">
          {label}
        </label>
        {hasInk && (
          <button
            type="button"
            onClick={clear}
            className="font-sans text-[0.7rem] text-[var(--muted)] underline-offset-4 hover:text-[var(--maroon)] hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="relative mt-2">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          className="h-36 w-full cursor-crosshair rounded-2xl border border-[var(--ivory-shadow)] bg-[var(--paper)] touch-none"
        />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-sans text-xs text-[var(--muted)]/70">
            Sign here with your finger
          </span>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-6 left-8 right-8 border-b border-dashed border-[var(--muted)]/35"
        />
      </div>
    </div>
  );
}
