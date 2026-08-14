# Character art

Drop the twelve illustrations here with **exactly** these names. Anything
missing falls back to the drawn SVG stand-in automatically, so a typo shows up
as a plain figure rather than a broken image.

```
request-f.webp   hand extended, confident      request-m.webp
show-f.webp      holding up fingers, hand on hip  show-m.webp
beg-f.webp       kneeling, hands clasped       beg-m.webp
mercy-f.webp     crying, tears flying          mercy-m.webp
threat-f.webp    arms crossed, eyes shut       threat-m.webp

scene-tying.webp     the two of them, rakhi being tied
scene-blessing.webp  the two of them, touching feet
```

`-f` is the girl in the yellow kurta, `-m` is the boy in red.

## Converting

WebP with transparency, ideally under 80KB each. Six of these render on one
wishlist, so a 500KB PNG each would put 3MB on a phone.

```bash
# one file
cwebp -q 82 -alpha_q 90 request-f.png -o request-f.webp

# everything in a folder
for f in *.png; do cwebp -q 82 -alpha_q 90 "$f" -o "${f%.png}.webp"; done
```

Or with ffmpeg, if that is what is already installed:

```bash
ffmpeg -i request-f.png -c:v libwebp -lossless 0 -q:v 82 request-f.webp
```

## Checking them

Transparent background, no white box, no pale halo on the outline. View one
against a dark background before accepting the batch — a fringe that is
invisible on white shows up immediately on `#111`.
