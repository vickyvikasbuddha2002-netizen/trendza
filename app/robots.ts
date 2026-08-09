import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Individual wishes and agreements are private between two people.
      // They also carry `robots: noindex` in their own metadata; this stops
      // a crawler requesting them at all.
      disallow: ["/w/", "/a/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
