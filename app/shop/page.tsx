import type { Metadata } from "next";
import Link from "next/link";
import { ThreadRule } from "@/components/Ambient";
import { PageShell } from "@/components/PageShell";
import { ProductMotif } from "@/components/ProductMotif";
import { PRODUCTS, amazonUrl } from "@/lib/products";

export const metadata: Metadata = {
  title: "Rakhi gifts — Trendza",
  description:
    "A short, hand-picked list of rakhi sets, sweets, hampers and keepsakes on Amazon India.",
};

export default function ShopPage() {
  return (
    <PageShell petals={8} seed={23}>
      <main className="mx-auto max-w-4xl px-6 pb-10 pt-10 sm:px-8">
        <header className="text-center">
          <p className="font-sans text-[0.66rem] uppercase tracking-[0.4em] text-[var(--muted)]">
            Post it before the week runs out
          </p>
          <h1 className="mt-4 font-display text-[2.7rem] font-light leading-none text-[var(--maroon)] sm:text-6xl">
            Something they can hold
          </h1>
          <p className="mx-auto mt-5 max-w-lg font-sans text-sm leading-relaxed text-[var(--muted)]">
            A short list rather than a catalogue. Each one opens Amazon India, where
            you can compare and choose properly.
          </p>
        </header>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2">
          {PRODUCTS.map((product) => (
            <a
              key={product.id}
              href={amazonUrl(product)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group flex gap-5"
            >
              <div className="shrink-0 pt-1">
                <ProductMotif motif={product.motif} />
              </div>
              <div className="min-w-0">
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.24em] text-[var(--gold)]">
                  {product.forWhom}
                </p>
                <h2 className="mt-1.5 font-display text-2xl font-light text-[var(--maroon)] transition group-hover:text-[var(--maroon-soft)]">
                  {product.title}
                </h2>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[var(--muted)]">
                  {product.blurb}
                </p>
                <span className="mt-3 inline-block font-sans text-[0.76rem] tracking-wide text-[var(--maroon-soft)] underline-offset-4 group-hover:underline">
                  See them on Amazon →
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-16">
          <ThreadRule />
        </div>

        <section className="mt-10 text-center">
          <p className="mx-auto max-w-lg font-sans text-[0.7rem] leading-relaxed text-[var(--muted)]">
            As an Amazon Associate, Trendza earns from qualifying purchases. This costs
            you nothing extra, and it is what keeps the wishes free to make and send.
            Prices and availability are set by Amazon and change often.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3">
            <Link
              href="/create"
              className="rounded-full bg-[var(--maroon)] px-8 py-3.5 font-sans text-[0.8rem] tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
            >
              Make a rakhi wish →
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
