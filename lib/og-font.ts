/**
 * Fetches Cormorant Garamond for use inside `ImageResponse`.
 *
 * Two traps here, both of which cost a broken build to find:
 *
 * 1. Satori has no access to the page's webfonts and does not resolve generic
 *    family names. `fontFamily: "serif"` silently renders in the bundled sans.
 *    Font data has to be handed over explicitly.
 *
 * 2. Google Fonts serves **woff2** to any modern User-Agent, and Satori cannot
 *    parse woff2 — it throws "Unsupported OpenType signature". Asking as an
 *    older browser gets TTF or WOFF, both of which it does support.
 *
 * The bytes are checked before being returned, so a change at Google's end
 * degrades to the fallback font instead of failing the build.
 */

// Safari 5 predates woff2, so Google serves it a plain TTF.
const LEGACY_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50";

const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&display=swap";

let cached: ArrayBuffer | null | undefined;

export async function loadSerif(): Promise<ArrayBuffer | null> {
  if (cached !== undefined) return cached;

  try {
    const css = await fetch(FONT_CSS, {
      headers: { "User-Agent": LEGACY_UA },
      next: { revalidate: 86400 },
    }).then((r) => r.text());

    const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!url) return (cached = null);

    const data = await fetch(url, { next: { revalidate: 86400 } }).then((r) =>
      r.arrayBuffer(),
    );

    return (cached = isParseable(data) ? data : null);
  } catch {
    return (cached = null);
  }
}

/**
 * TTF (0x00010000), OTF ("OTTO"), and WOFF ("wOFF") are all fine. WOFF2
 * ("wOF2") is not — returning it is what breaks the render.
 */
function isParseable(data: ArrayBuffer): boolean {
  if (data.byteLength < 4) return false;
  const tag = new DataView(data).getUint32(0);
  return (
    tag === 0x00010000 || // TrueType
    tag === 0x4f54544f || // 'OTTO'
    tag === 0x74727565 || // 'true'
    tag === 0x774f4646 // 'wOFF'
  );
}
