import { ImageResponse } from "next/og";
import { loadSerif } from "@/lib/og-font";

export const alt = "Trendza — rakhi wishes for the ones far away";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card for the site itself — every page that has no card of its own. */
export default async function Image() {
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
            left: -160,
            width: 720,
            height: 720,
            borderRadius: 360,
            background:
              "radial-gradient(circle, rgba(233,168,80,0.42), rgba(233,168,80,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -260,
            right: -180,
            width: 720,
            height: 720,
            borderRadius: 360,
            background:
              "radial-gradient(circle, rgba(214,120,130,0.32), rgba(214,120,130,0) 70%)",
          }}
        />

        {/* The rakhi: thread, petals, centre stone */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 210, height: 3, background: "#c9a227" }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 48,
              border: "3px solid #c9a227",
              margin: "0 -6px",
            }}
          >
            <div
              style={{ width: 48, height: 48, borderRadius: 24, background: "#6e1b24" }}
            />
          </div>
          <div style={{ width: 210, height: 3, background: "#c9a227" }} />
        </div>

        <div
          style={{
            fontSize: 82,
            color: "#6e1b24",
            marginTop: 44,
            textAlign: "center",
            lineHeight: 1.06,
            maxWidth: 900,
          }}
        >
          For the ones who are far away
        </div>

        <div
          style={{
            fontSize: 30,
            color: "#97444d",
            marginTop: 26,
            textAlign: "center",
            maxWidth: 760,
          }}
        >
          Rakhi wishes made of your photographs, sent as a link
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 44,
            fontSize: 21,
            letterSpacing: 9,
            textTransform: "uppercase",
            color: "#8a7a6e",
            fontFamily: "sans-serif",
          }}
        >
          Trendza
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
