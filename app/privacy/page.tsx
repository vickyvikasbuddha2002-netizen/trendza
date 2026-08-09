import type { Metadata } from "next";
import Link from "next/link";
import { ThreadRule } from "@/components/Ambient";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "What happens to your photos — Trendza",
  description:
    "Your photos are encrypted on your own device before they are uploaded. We cannot open them, and they delete themselves on the schedule you choose.",
};

export default function PrivacyPage() {
  return (
    <PageShell petals={6} seed={53}>
      <main className="mx-auto max-w-2xl px-6 pb-10 pt-10 sm:px-8">
        <h1 className="font-display text-[2.6rem] font-light leading-tight text-[var(--maroon)] sm:text-5xl">
          What happens to your photos
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-[var(--muted)]">
          The short version: they are locked on your phone before they are sent,
          we do not have the key, and they delete themselves.
        </p>

        <div className="mt-10">
          <ThreadRule />
        </div>

        <Section title="We cannot see your photos. This is not a promise, it is arithmetic.">
          When you make a wish, your browser generates a random key and uses it to
          encrypt your photographs, your message and your notes{" "}
          <em>before anything is uploaded</em>. What arrives on our server is
          scrambled data.
          <br />
          <br />
          That key is placed in the part of the link after the <code>#</code>. Web
          browsers never send that part to any server — not to us, not to anyone.
          So the key is never in our database, never in our logs, and never on our
          machines. If we opened your file, we would see meaningless noise, and
          there is nothing we could do about it.
        </Section>

        <Section title="Only the two first names are readable.">
          The names of the sender and recipient are kept in plain text, because
          the preview that appears in WhatsApp needs something to show. Everything
          else — the message, every photograph, every note — is encrypted.
        </Section>

        <Section title="They delete themselves.">
          Whoever makes the wish chooses how long it lives: 24 hours, 7 days, 30
          days, or indefinitely. When that time is up, the wish stops opening
          immediately, and the encrypted files are erased from storage
          permanently. Nobody can recover them afterwards, including us.
        </Section>

        <Section title="No accounts, and nothing that follows you.">
          Trendza has no sign-up, no password and no profile. We do not ask for
          your email or phone number. There are no advertising trackers and no
          third-party analytics. The only numbers we keep are three totals on the
          front page — how many people have visited, how many wishes exist, and
          how many agreements have been signed. None of them are tied to a person.
        </Section>

        <Section title="Anyone with the link can open the wish.">
          Worth being clear about the other side of this. There is no password, so
          the link itself is the key — if it is forwarded, whoever receives it can
          open the wish. Send it to people you mean to send it to.
        </Section>

        <Section title="The shopping links.">
          Trendza is an Amazon Associate and earns a commission when someone buys
          through a link on the gifts page. It costs you nothing extra. Amazon
          will know you arrived from here; that part is theirs, not ours, and
          their policies apply once you are on their site.
        </Section>

        <div className="mt-14">
          <ThreadRule />
        </div>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/create"
            className="rounded-full bg-[var(--maroon)] px-8 py-3.5 text-center font-sans text-sm tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
          >
            Make a rakhi wish
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[var(--ivory-shadow)] px-8 py-3.5 text-center font-sans text-sm text-[var(--maroon)] transition hover:border-[var(--gold)]"
          >
            Back to the start
          </Link>
        </div>
      </main>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-light text-[var(--maroon)]">{title}</h2>
      <p className="mt-3 font-sans text-sm leading-relaxed text-[var(--ink)]">
        {children}
      </p>
    </section>
  );
}
