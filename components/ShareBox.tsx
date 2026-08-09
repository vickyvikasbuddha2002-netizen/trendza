"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Share affordances for a freshly created link.
 *
 * The full URL is only assembled after mount — during SSR there is no
 * window, and NEXT_PUBLIC_SITE_URL is often still pointed at localhost in
 * development. Reading the live origin keeps the copied link correct
 * wherever this happens to be running.
 */
export function ShareBox({
  path,
  shareText,
  previewLabel,
}: {
  path: string;
  shareText: string;
  previewLabel: string;
}) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "";
    setUrl(`${origin}${path}`);
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, [path]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older mobile browsers and any non-secure origin.
      const field = document.createElement("textarea");
      field.value = url;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ text: shareText, url });
    } catch {
      /* dismissed */
    }
  };

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`;

  return (
    <div className="mt-9">
      <div className="flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--ivory-deep)]/50 py-2 pl-5 pr-2">
        <span className="tz-scroll-hidden min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-sans text-sm text-[var(--ink)]">
          {url || "…"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full bg-[var(--maroon)] px-5 py-2.5 font-sans text-xs tracking-wide text-[var(--ivory)] transition hover:bg-[var(--maroon-soft)]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full bg-[#128C7E] px-6 py-3.5 text-center font-sans text-sm tracking-wide text-white transition hover:bg-[#0f7a6d]"
        >
          Send on WhatsApp
        </a>
        {canNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="flex-1 rounded-full border border-[var(--ivory-shadow)] px-6 py-3.5 font-sans text-sm text-[var(--maroon)] transition hover:border-[var(--gold)]"
          >
            More ways to share
          </button>
        )}
      </div>

      <Link
        href={path}
        className="mt-5 inline-block font-sans text-sm text-[var(--muted)] underline-offset-4 transition hover:text-[var(--maroon-soft)] hover:underline"
      >
        {previewLabel} →
      </Link>
    </div>
  );
}
