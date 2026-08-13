import { ImageResponse } from "next/og";
import { loadSerif } from "@/lib/og-font";
import { getWishlistServer } from "@/lib/server-db";

export const alt = "A Raksha Bandhan wishlist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The single highest-leverage piece of the feature. The preview card in the
 * chat decides whether the link is opened at all, and a named card built
 * around the recipient's own name outperforms a static banner by a wide
 * margin — so this is the one thing that must never be cut.
 */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = await getWishlistServer(id);

  const to = list?.to || "you";
  const from = list?.from || "Someone";
  const count = list?.wishes.length ?? 0;
  const serif = await loadSerif();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fdf9f3",
          fontFamily: serif ? "Cormorant" : "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -150,
            width: 700,
            height: 700,
            borderRadius: 350,
            background:
              "radial-gradient(circle, rgba(233,168,80,0.42), rgba(233,168,80,0) 70%)",
          }}
        />

        <div
          style={{
            fontSize: 24,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#8a7a6e",
            fontFamily: "sans-serif",
          }}
        >
          Yes, you
        </div>

        <div style={{ fontSize: 120, color: "#6e1b24", marginTop: 12, lineHeight: 1 }}>
          {to}
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 34 }}>
          <div style={{ width: 150, height: 2, background: "#c9a227" }} />
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              background: "#c9a227",
              margin: "0 12px",
            }}
          />
          <div style={{ width: 150, height: 2, background: "#c9a227" }} />
        </div>

        <div style={{ fontSize: 44, color: "#97444d", marginTop: 32, textAlign: "center" }}>
          {from} has {count} demand{count === 1 ? "" : "s"}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 46,
            fontSize: 22,
            letterSpacing: 7,
            textTransform: "uppercase",
            color: "#8a7a6e",
            fontFamily: "sans-serif",
          }}
        >
          Open the list
        </div>
      </div>
    ),
    {
      ...size,
      fonts: serif
        ? [{ name: "Cormorant", data: serif, style: "normal", weight: 400 }]
        : undefined,
    },
  );
}
