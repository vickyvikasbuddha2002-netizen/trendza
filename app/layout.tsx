import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Special_Elite } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const typewriter = Special_Elite({
  variable: "--font-typewriter",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Trendza — Rakhi wishes for the ones far away",
  description:
    "Make a rakhi wish full of your photographs and send it as a link. Free, no account needed.",
  openGraph: {
    type: "website",
    siteName: "Trendza",
    title: "Trendza — Rakhi wishes for the ones far away",
    description:
      "Make a rakhi wish full of your photographs and send it as a link. Free, no account needed.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  themeColor: "#fdf9f3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${typewriter.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
