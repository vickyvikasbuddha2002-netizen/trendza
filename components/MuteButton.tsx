"use client";

export function MuteButton({
  muted,
  onToggle,
}: {
  muted: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      aria-pressed={!muted}
      className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--gold)]/35 bg-[var(--ivory)]/80 text-[var(--maroon)] shadow-sm backdrop-blur-md transition hover:border-[var(--gold)] hover:bg-[var(--ivory)] sm:right-6 sm:top-6"
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 9.5v5a1 1 0 0 0 1 1h2.6l3.7 3a.8.8 0 0 0 1.3-.6V6.1a.8.8 0 0 0-1.3-.6l-3.7 3H5a1 1 0 0 0-1 1Z"
          fill="currentColor"
        />
        {muted ? (
          <path
            d="m16.5 9.5 4 5m0-5-4 5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        ) : (
          <>
            <path
              d="M16.4 9.2a4 4 0 0 1 0 5.6"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              d="M18.9 6.8a7.5 7.5 0 0 1 0 10.4"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              opacity="0.55"
            />
          </>
        )}
      </svg>
    </button>
  );
}
