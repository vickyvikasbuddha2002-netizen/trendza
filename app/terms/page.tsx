import type { Metadata } from "next";
import Link from "next/link";
import { ThreadRule } from "@/components/Ambient";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Terms of use — Trendza",
  description:
    "The terms you agree to when you create a wish or an agreement on Trendza.",
};

export default function TermsPage() {
  return (
    <PageShell petals={5} seed={61}>
      <main className="mx-auto max-w-2xl px-6 pb-10 pt-10 sm:px-8">
        <h1 className="font-display text-[2.6rem] font-light leading-tight text-[var(--maroon)] sm:text-5xl">
          Terms of use
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-[var(--muted)]">
          Short version: the photos you upload are yours and they are your
          responsibility. Trendza is a free tool, provided as it is, with no
          guarantees. Do not upload anything you do not have the right to share.
        </p>

        <div className="mt-10">
          <ThreadRule />
        </div>

        <Clause n="1" title="Agreeing to these terms">
          By creating a wish or an agreement on Trendza, you agree to these terms.
          If you do not agree, please do not use the service.
        </Clause>

        <Clause n="2" title="Who may use Trendza">
          You must be at least 13 years old. If you are under 18, you may only use
          Trendza with the permission of a parent or guardian.
        </Clause>

        <Clause n="3" title="Your content stays yours">
          You keep all rights to the photographs, messages and notes you upload.
          You grant Trendza only the narrow permission needed to run the service:
          to store your encrypted files and serve them to whoever opens your link,
          until the wish expires or is removed.
        </Clause>

        <Clause n="4" title="You are responsible for what you upload">
          By uploading anything, you confirm that it is yours to share, and that
          anyone identifiable in a photograph is happy for it to be shared this
          way. Trendza cannot check this — your content is encrypted before it
          reaches us and we cannot read it. Responsibility for it is entirely
          yours.
        </Clause>

        <Clause n="5" title="What you must not upload">
          Nothing unlawful, hateful, harassing, sexual, or involving the
          exploitation of children. Nothing that infringes anyone&apos;s rights.
          Nothing intended to deceive, defraud or impersonate. Do not use Trendza
          to store or distribute files unrelated to a wish or an agreement.
        </Clause>

        <Clause n="6" title="Encryption, and what it means for you">
          Your content is encrypted in your browser before upload, with a key that
          exists only in your link. We cannot open your files, and we cannot
          recover them for you. If the link is lost, altered or truncated, the
          content is gone permanently. Anyone who has the full link can open the
          wish, so send it only to people you intend to.
        </Clause>

        <Clause n="7" title="Storage and deletion">
          You choose how long a wish is kept. Once that time passes it stops
          opening immediately, and the encrypted files are deleted. We may also
          delete content, or limit uploads, to keep the service running within its
          storage capacity. We do not guarantee that any wish will remain
          available for any particular period.
        </Clause>

        <Clause n="8" title="No warranty">
          Trendza is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;,
          without warranties of any kind, express or implied. We do not promise
          that it will be uninterrupted, error free, or that content will never be
          lost. It is a free tool made for one festival, not a backup service.
          Keep your own copies of anything you care about.
        </Clause>

        <Clause n="9" title="Limitation of liability">
          To the fullest extent permitted by law, Trendza and its operator are not
          liable for any indirect, incidental, special or consequential loss, nor
          for loss of data, goodwill or profits, arising from your use of the
          service. Where liability cannot be excluded, it is limited to the amount
          you paid to use Trendza, which is nothing.
        </Clause>

        <Clause n="10" title="Indemnity">
          You agree to indemnify Trendza and its operator against any claim,
          demand, loss or expense arising from content you uploaded, from your use
          of the service, or from your breach of these terms.
        </Clause>

        <Clause n="11" title="The agreement tool is a joke">
          The Sibling Accord is a novelty. It is not a contract, it creates no
          legal obligation of any kind, and the signatures on it carry no legal
          weight whatsoever.
        </Clause>

        <Clause n="12" title="Shopping links">
          Trendza is a participant in the Amazon Associates programme and earns
          commission on qualifying purchases made through links on the gifts page.
          We do not sell anything ourselves. Purchases are between you and the
          retailer, and their terms apply.
        </Clause>

        <Clause n="13" title="Removing content">
          We may remove any content and restrict access to the service at any
          time, particularly where content appears to breach these terms or where
          we receive a credible complaint.
        </Clause>

        <Clause n="14" title="Changes">
          These terms may change. The version published here at the time you
          create a wish is the one that applies to it.
        </Clause>

        <Clause n="15" title="Governing law">
          These terms are governed by the laws of India, and the courts of India
          have exclusive jurisdiction over any dispute arising from them.
        </Clause>

        <div className="mt-14">
          <ThreadRule />
        </div>

        <p className="mt-8 font-sans text-[0.7rem] leading-relaxed text-[var(--muted)]">
          See also{" "}
          <Link
            href="/privacy"
            className="text-[var(--maroon-soft)] underline-offset-4 hover:underline"
          >
            what happens to your photos
          </Link>
          .
        </p>

        <div className="mt-9">
          <Link
            href="/create"
            className="inline-block rounded-full bg-[var(--maroon)] px-8 py-3.5 font-sans text-sm tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
          >
            Make a rakhi wish
          </Link>
        </div>
      </main>
    </PageShell>
  );
}

function Clause({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-9">
      <h2 className="font-display text-xl font-light text-[var(--maroon)]">
        <span className="mr-2 font-sans text-[0.7rem] tracking-widest text-[var(--gold)]">
          {n}
        </span>
        {title}
      </h2>
      <p className="mt-2 font-sans text-sm leading-relaxed text-[var(--ink)]">
        {children}
      </p>
    </section>
  );
}
