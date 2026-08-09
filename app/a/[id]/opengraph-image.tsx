import { ImageResponse } from "next/og";
import { loadSerif } from "@/lib/og-font";
import { getAgreementServer } from "@/lib/server-db";

export const alt = "The Sibling Accord";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agreement = await getAgreementServer(id);

  const partyA = agreement?.partyA || "Someone";
  const partyB = agreement?.partyB || "you";
  const executed = Boolean(agreement?.signatureB);
  const count = agreement?.clauses.length ?? 0;
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
          background: "#f7f1e4",
          fontFamily: serif ? "Cormorant" : "sans-serif",
          padding: 70,
          border: "3px solid rgba(201,162,39,0.45)",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#8a7a6e",
            fontFamily: "sans-serif",
          }}
        >
          Entirely unofficial · Utterly binding
        </div>

        <div
          style={{
            fontSize: 82,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#6e1b24",
            marginTop: 26,
            textAlign: "center",
          }}
        >
          The Sibling Accord
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 30 }}>
          <div style={{ width: 150, height: 2, background: "rgba(201,162,39,0.7)" }} />
          <div
            style={{
              width: 14,
              height: 14,
              background: "#c9a227",
              margin: "0 14px",
              transform: "rotate(45deg)",
            }}
          />
          <div style={{ width: 150, height: 2, background: "rgba(201,162,39,0.7)" }} />
        </div>

        <div style={{ fontSize: 40, color: "#2a1f1c", marginTop: 34, textAlign: "center" }}>
          {partyA} &nbsp;·&nbsp; {partyB}
        </div>

        <div
          style={{
            fontSize: 30,
            color: executed ? "#6e1b24" : "#97444d",
            marginTop: 26,
            fontFamily: "sans-serif",
          }}
        >
          {executed
            ? `${count} terms · signed by both`
            : `${count} terms awaiting your signature`}
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
