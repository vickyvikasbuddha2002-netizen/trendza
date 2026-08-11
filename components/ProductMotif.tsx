import type { Category } from "@/lib/products";

const PATHS: Record<Category["motif"], React.ReactNode> = {
  thread: (
    <>
      <path d="M2 26h14M36 26h14" />
      <circle cx="26" cy="26" r="7" />
      <circle cx="26" cy="26" r="12" />
      <path d="M26 14v-4M26 42v4M14 26h-2M40 26h2" />
    </>
  ),
  sweets: (
    <>
      <path d="M8 30h36l-3 14H11z" />
      <path d="M14 30c0-6 5-10 12-10s12 4 12 10" />
      <path d="M20 22l3-6M32 22l-3-6" />
    </>
  ),
  hamper: (
    <>
      <rect x="9" y="22" width="34" height="22" rx="2" />
      <path d="M9 30h34M26 22v22" />
      <path d="M18 22c0-7 4-12 8-12s8 5 8 12" />
    </>
  ),
  silver: (
    <>
      <circle cx="26" cy="30" r="13" />
      <circle cx="26" cy="30" r="8" />
      <path d="M26 8v9M20 12l3 6M32 12l-3 6" />
    </>
  ),
  kids: (
    <>
      <circle cx="26" cy="28" r="12" />
      <path d="M21 25h.01M31 25h.01" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 33c2 3 4 4 6 4s4-1 6-4" />
      <path d="M26 16V9M17 19l-5-5M35 19l5-5" />
    </>
  ),
  card: (
    <>
      <rect x="10" y="14" width="32" height="26" rx="2" />
      <path d="M10 18l16 12 16-12" />
      <path d="M26 44v4" />
    </>
  ),
};

export function ProductMotif({ motif }: { motif: Category["motif"] }) {
  return (
    <svg
      viewBox="0 0 52 52"
      className="h-12 w-12"
      fill="none"
      stroke="var(--gold)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[motif]}
    </svg>
  );
}
