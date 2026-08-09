import type { Wish } from "./types";

/**
 * A sample wish served at /w/demo.
 *
 * Doubles as the "see an example" link on the landing page — people want to
 * know what they are about to make before they start uploading photographs of
 * their family. It is the one wish that is not encrypted, because there is no
 * key in the URL to decrypt it with; `plaintext` tells the viewer to skip
 * decryption entirely.
 */
function placeholder(from: string, to: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
</linearGradient></defs>
<rect width="1200" height="800" fill="url(#g)"/>
<circle cx="880" cy="230" r="120" fill="${accent}" opacity="0.5"/>
<circle cx="330" cy="600" r="190" fill="${accent}" opacity="0.28"/>
<text x="600" y="415" font-family="Georgia,serif" font-size="34" fill="#fdf9f3"
 opacity="0.85" text-anchor="middle">your photograph here</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEMO_WISH: Wish = {
  id: "demo",
  to: "Ananya",
  from: "Rohan",
  message:
    "Every year you tie this thread and tell me it is just tradition.\n" +
    "It has never once been just tradition.\n" +
    "I am sorry I am not there again this year.",
  photos: [
    {
      url: placeholder("#e8a13c", "#d67882", "#fdf9f3"),
      note: "The summer everything was mango and nobody had anywhere to be.",
      w: 1200,
      h: 800,
    },
    {
      url: placeholder("#c9a227", "#97444d", "#f0dfa8"),
      w: 1200,
      h: 800,
    },
    {
      url: placeholder("#d67882", "#6e1b24", "#e5c86a"),
      note: "You were furious about this photograph. You are still furious about it.",
      w: 1200,
      h: 800,
    },
  ],
  createdAt: Date.now(),
  retention: "forever",
  expiresAt: null,
  plaintext: true,
};
