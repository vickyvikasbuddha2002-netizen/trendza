import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WishlistViewer from "@/components/WishlistViewer";
import { getWishlistServer } from "@/lib/server-db";

// Server-rendered on purpose. WhatsApp's crawler does not execute JavaScript,
// so a client-rendered page gets no preview card and the share dies on arrival.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/list/[id]">): Promise<Metadata> {
  const { id } = await params;
  const list = await getWishlistServer(id);
  if (!list) return { title: "This list could not be found — Trendza" };

  const title = `${list.from} has demands for you, ${list.to}`;
  const description = `${list.wishes.length} demand${
    list.wishes.length === 1 ? "" : "s"
  } this Raksha Bandhan. Not asking for much, honestly.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false },
  };
}

export default async function WishlistPage({ params }: PageProps<"/list/[id]">) {
  const { id } = await params;
  const list = await getWishlistServer(id);
  if (!list) notFound();

  return <WishlistViewer list={list} />;
}
