# Trendza — Rakhi

Virtual rakhi wishes with photo memories, a joke sibling contract with finger
signatures, and an Amazon marketplace. No accounts anywhere.

Next.js 16 · React 19 · Tailwind 4 · Framer Motion · Firebase (Firestore + Storage)

```bash
npm run dev
```

---

## 0. Enable Firebase Storage — it does not exist yet

Photo uploads hang forever without this. Verified: every candidate bucket name
(`trendza-720ac.firebasestorage.app`, `.appspot.com`, bare) returns **HTTP 404
not-found**, not 403 denied. Storage has never been provisioned on this project.

[console.firebase.google.com](https://console.firebase.google.com/project/trendza-720ac/storage)
→ **Storage** → **Get started** → accept the default rules and pick a region.

> Pick the region carefully — **it cannot be changed afterwards.** For an Indian
> audience choose `asia-south1` (Mumbai). Your Realtime Database is already in
> `asia-southeast1`, so that region is also reasonable.

Then check the bucket name it gives you actually matches
`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` in `.env.local`, and correct it if not.

## 1. Publish the Firebase rules — nothing works until you do

The `trendza-720ac` project currently denies all access to the `wishes`,
`agreements` and `stats` collections. Verified by direct API call: every read
returns `PERMISSION_DENIED`. Until these are published, every wish, photo
upload and counter fails silently.

**Firestore:** [console.firebase.google.com](https://console.firebase.google.com/project/trendza-720ac/firestore/rules)
→ Firestore Database → Rules → paste [`firestore.rules`](./firestore.rules) → Publish

**Storage:** same console → Storage → Rules → paste [`storage.rules`](./storage.rules) → Publish

> **Read the header comment in each file first.** Your live site reads a `posts`
> collection. `firestore.rules` preserves that, but if your current rules cover
> anything else — the `saved` feature, anything written behind Google login —
> merge the blocks in rather than replacing the whole file, or you will break it.

Confirm it worked: the landing page counters should move off `0` on first load.

### What the rules do

- `allow list: if false` on wishes and agreements. Reading one requires already
  knowing its 12-character id. Without this, anyone could ask Firestore for the
  whole collection and walk every family photo on the site.
- Wishes are immutable once created. No accounts exist to prove ownership with,
  so nothing can be edited or deleted.
- Agreements permit exactly one mutation: adding the second signature, once,
  and only while it is still missing.
- Storage: images only, 4MB cap, no overwrite, no delete.

## 1b. Bucket CORS — needed because the photos are encrypted

An `<img src>` needs no CORS. But encrypted photos have to be pulled with
`fetch()` and decrypted before they can be displayed, and `fetch()` does. If
photos fail with a CORS error in the console, apply [`cors.json`](./cors.json):

```bash
gcloud storage buckets update gs://trendza-720ac.firebasestorage.app --cors-file=cors.json
```

Edit the origins in that file first — it currently lists `trendza.life`,
`rakhi.trendza.life` and `localhost:3000`.

## 1c. Automatic deletion

The app refuses to serve an expired wish the moment it expires, so the user's
promise is kept exactly. These two settings do the actual cleanup afterwards.

**Cloud Storage lifecycle** — Google Cloud console → Cloud Storage → your bucket
→ Lifecycle → add three rules, each *Delete object* with *Age* and a *prefix*:

| Prefix | Age |
|---|---|
| `wishes/24h/` | 1 day |
| `wishes/7d/` | 7 days |
| `wishes/30d/` | 30 days |

Nothing matches `wishes/forever/`, which is the point. The retention class is
baked into the storage path precisely so one bucket can honour four different
windows.

**Firestore TTL** — Firebase console → Firestore → TTL → create a policy on
collection `wishes`, field `expiresAt`. Documents with a null `expiresAt` are
ignored, so "forever" wishes are never touched.

> Both run as **daily batches**, so a file can outlive its deadline by hours.
> That is why expiry is enforced in the app as well — never promise the user
> a precision the infrastructure does not have.

## 2. Environment variables

| Variable | Change it to |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Real origin, e.g. `https://rakhi.trendza.life`. Used for OG image absolute URLs, `robots.txt` and `sitemap.xml`. |
| `NEXT_PUBLIC_AMAZON_TAG` | **Your actual Associates tag.** Currently `trendza-21`, which was a guess — every shop link earns nothing until this is right. |

Set both in the Vercel project's environment variables too. `.env.local` is not
deployed, and a wrong `NEXT_PUBLIC_SITE_URL` in production means broken preview
cards on every shared link.

## 3. Deploying

`trendza.life` is on Vercel with DNS at GoDaddy. **This repo is not the source
of what is currently live there** — the deployed site is a different, newer
codebase than the local `C:\Users\vicky\trendza` folder, which is why nothing
here should be pushed over it blind.

Safest option, zero risk to the live site:

```bash
npx vercel --prod
```

Deploy as a **new** Vercel project, then in GoDaddy DNS add
`CNAME rakhi → cname.vercel-dns.com` and add `rakhi.trendza.life` as a domain
on that Vercel project.

To put it on the main domain instead, first find the repo connected to the
existing `trendza.life` Vercel project and merge this into it.

## 4. Smoke test on the live URL

In order, because each step depends on the last:

1. Landing page — counters move off `0`. If they stay at `0`, Firestore rules
   are not published.
2. `/create` — make a wish with two photos and a note. If it hangs on
   "Tying it together", Storage is not enabled.
3. Open the resulting link in a **different browser** — photos must decrypt and
   appear. A CORS error in the console means step 1b is still needed.
4. Delete everything after the `#` from that link and open it — you should get
   "This link is incomplete", not a broken page.
5. Paste the full link into a WhatsApp chat with yourself — the preview card
   should show both names on ivory and gold.
6. `/agreement` — build one, sign it, open the link, sign it back.

## Routes

| Route | What it is |
|---|---|
| `/` | Landing — countdown, both tools, live counters |
| `/create` | Wish builder, three steps |
| `/w/[id]` | The wish. Immersive, no chrome, generative audio |
| `/agreement` | Sibling Accord builder |
| `/a/[id]` | The contract — read it, sign it back |
| `/shop` | Marketplace |
| `/w/[id]/opengraph-image` · `/a/[id]/opengraph-image` | WhatsApp preview cards |

## Notes on a few decisions

**Audio is synthesised, not a file.** `lib/audio.ts` builds a drone and plucked
notes from Raag Bhoopali with the Web Audio API. Nothing to download, nothing
to licence, no loop seam. It can only start from a user gesture — that is what
the tap-to-untie is doing, browsers permit no other way.

**Photos are compressed in the browser** to 1600px WebP before upload
(`lib/compress.ts`). A 6MB phone photo becomes ~200KB. Uploading originals over
4G is the main reason people abandon halfway.

**Server reads go over the Firestore REST API** (`lib/server-firestore.ts`), not
the JS SDK — the SDK opens a listener channel that does not belong in a
request/response cycle.

**Only `transform` and `opacity` are animated**, so everything composites on the
GPU and holds up on budget Android. `prefers-reduced-motion` stops all ambient
motion and collapses reveals to plain fades.

**Brand appears once** on `/w/[id]`, at the very end after the closing bow.
Nowhere else on the wish or the agreement.

**Buy Me a Chai appears in two places only** (`components/ChaiLink.tsx`): quietly
in the footer of pages that have chrome, and warmly on the screen right after
someone finishes making something — the one moment they feel good about the site
rather than merely using it. It never appears on `/w/[id]` or `/a/[id]`. Asking
for money on top of someone's heartfelt message would cheapen the whole thing.

**Wishes are end-to-end encrypted** (`lib/crypto.ts`). A random AES-256-GCM key
is generated in the sender's browser; the photos, the message and the per-photo
notes are encrypted before upload. The key travels in the URL *fragment*
(`/w/abc#k=…`), which browsers never send in an HTTP request — so it is not in
the server logs, not in Firestore, and not recoverable by us.

Two consequences that are not reversible:

- **The WhatsApp preview card cannot show a photo.** The server cannot decrypt.
  It shows both names on the ivory-and-gold card instead.
- **Lose the fragment, lose the wish.** If a messaging app truncates the link at
  the `#`, the photos are gone permanently. `/w/[id]` detects this before the
  reader taps and explains it rather than failing at the last step.

Only the two names and the expiry are readable server-side. Verified in-browser:
a 200KB payload round-trips byte-identical, a wrong key is rejected by the GCM
auth tag rather than returning garbage, and decryption costs ~0.1ms per photo.

## Not done

- Products link to Amazon India *searches*, not specific ASINs. Deliberate — a
  specific product going out of stock during the one week this matters is worse
  than no link. Swap to ASINs once the Associates account clears.
- No analytics beyond the three public counters.
- The counters are incrementable by anyone. Worst case is an inflated number.
