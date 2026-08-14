/**
 * Converts the character PNGs in public/characters to WebP, in place.
 *
 *   npm run characters
 *
 * Six characters render on a single wishlist card deck. As PNGs that is
 * several megabytes on a phone; as WebP it is a few hundred kilobytes, with
 * transparency preserved and no visible difference at the sizes shown.
 *
 * The originals are left alone. The app prefers .webp and falls back to .png,
 * so this is safe to run at any point — before the files are named correctly,
 * after, or not at all.
 */

import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const DIR = join(process.cwd(), "public", "characters");

const EXPECTED = [
  "request-f", "request-m",
  "show-f", "show-m",
  "beg-f", "beg-m",
  "mercy-f", "mercy-m",
  "threat-f", "threat-m",
  "scene-tying", "scene-blessing",
];

const files = (await readdir(DIR).catch(() => [])).filter((f) =>
  f.toLowerCase().endsWith(".png"),
);

if (files.length === 0) {
  console.log("No PNGs found in public/characters — nothing to do.");
  process.exit(0);
}

let saved = 0;

for (const file of files) {
  const from = join(DIR, file);
  const to = from.replace(/\.png$/i, ".webp");

  const before = (await stat(from)).size;

  await sharp(from)
    // Characters are shown at 230px at most; 640 leaves room for retina
    // without carrying pixels nobody will ever see.
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90, effort: 5 })
    .toFile(to);

  const after = (await stat(to)).size;
  saved += before - after;

  const pct = Math.round((1 - after / before) * 100);
  console.log(
    `${file.padEnd(24)} ${(before / 1024).toFixed(0).padStart(5)}KB → ${(after / 1024)
      .toFixed(0)
      .padStart(5)}KB  (-${pct}%)`,
  );
}

console.log(`\nSaved ${(saved / 1024 / 1024).toFixed(2)}MB across ${files.length} files.`);

const names = new Set(files.map((f) => f.replace(/\.png$/i, "")));
const missing = EXPECTED.filter((n) => !names.has(n));
if (missing.length) {
  console.log(
    `\nStill missing (these will fall back to the drawn figure):\n  ${missing.join("\n  ")}`,
  );
}
