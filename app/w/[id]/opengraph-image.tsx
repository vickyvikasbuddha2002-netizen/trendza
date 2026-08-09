import { ImageResponse } from "next/og";
import { loadSerif } from "@/lib/og-font";
import { getWishServer } from "@/lib/server-db";

export const alt = "A rakhi wish";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The WhatsApp preview card.
 *
 * Almost every one of these links is opened from a chat, and the grey preview
 * box is the first thing anyone sees. It cannot show a photograph any more —
 * the photos are encrypted and the key never reaches the server — so the two
 * names have to carry it. That is the trade for end-to-end encryption.
 */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getWishServer(id);

  const to = result.status === "ok" ? result.wish.to : result.status === "expired" ? result.to : "you";
  const from =
    result.status === "ok" ? result.wish.from : result.status === "expired" ? result.from : "someone";
  const expired = result.status === "expired";
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
        {/* Warm bloom, so the card is not a flat rectangle of cream */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -140,
            width: 700,
            height: 700,
            borderRadius: 350,
            background:
              "radial-gradient(circle, rgba(233,168,80,0.40), rgba(233,168,80,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -240,
            right: -160,
            width: 700,
            height: 700,
            borderRadius: 350,
            background:
              "radial-gradient(circle, rgba(214,120,130,0.34), rgba(214,120,130,0) 70%)",
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
          {expired ? "This wish has expired" : "A rakhi wish"}
        </div>

        <div style={{ fontSize: 118, color: "#6e1b24", marginTop: 16, lineHeight: 1 }}>
          For {to}
        </div>

        {/* The thread and its knot */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 40 }}>
          <div style={{ width: 170, height: 2, background: "#c9a227" }} />
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "#c9a227",
              margin: "0 12px",
            }}
          />
          <div style={{ width: 170, height: 2, background: "#c9a227" }} />
        </div>

        <div style={{ fontSize: 44, color: "#97444d", marginTop: 38 }}>from {from}</div>

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
          {expired ? "The photographs are gone" : "Tap to open"}
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
