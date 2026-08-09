import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WishExperience from "@/components/WishExperience";
import { WishUnavailable } from "@/components/WishUnavailable";
import { getWishServer } from "@/lib/server-db";

export async function generateMetadata({
  params,
}: PageProps<"/w/[id]">): Promise<Metadata> {
  const { id } = await params;
  const result = await getWishServer(id);

  if (result.status === "missing") {
    return { title: "This wish could not be found — Trendza" };
  }
  if (result.status === "expired") {
    return { title: "This wish has expired — Trendza" };
  }

  // The message is encrypted, so there is nothing to quote in the description.
  // The two names are all the server can read, and they are the part that
  // makes someone tap anyway.
  const title = `${result.wish.from} sent you a rakhi wish, ${result.wish.to}`;
  const description = "Open it to read what they wrote.";

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false },
  };
}

export default async function WishPage({ params }: PageProps<"/w/[id]">) {
  const { id } = await params;
  const result = await getWishServer(id);

  if (result.status === "missing") notFound();
  if (result.status === "expired") {
    return <WishUnavailable variant="expired" to={result.to} from={result.from} />;
  }

  return <WishExperience wish={result.wish} />;
}
