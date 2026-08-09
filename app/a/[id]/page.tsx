import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AgreementViewer from "@/components/AgreementViewer";
import { getAgreementServer } from "@/lib/server-firestore";

export async function generateMetadata({
  params,
}: PageProps<"/a/[id]">): Promise<Metadata> {
  const { id } = await params;
  const agreement = await getAgreementServer(id);
  if (!agreement) return { title: "This agreement could not be found — Trendza" };

  const title = agreement.signatureB
    ? `${agreement.partyA} and ${agreement.partyB} have signed the Sibling Accord`
    : `${agreement.partyA} needs your signature, ${agreement.partyB}`;
  const description = `${agreement.clauses.length} terms. Entirely unofficial, utterly binding.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false },
  };
}

export default async function AgreementPage({ params }: PageProps<"/a/[id]">) {
  const { id } = await params;
  const agreement = await getAgreementServer(id);
  if (!agreement) notFound();

  return <AgreementViewer agreement={agreement} />;
}
