import { ImageResponse } from "next/og";

export const alt = "HUMANITY ONE — Opportunities, learning, work and dignity";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 88px",
          color: "#ffffff",
          background:
            "linear-gradient(135deg, #071b35 0%, #0c3850 52%, #087e79 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f2c66d",
              color: "#08243a",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            H
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 2 }}>
            HUMANITY ONE
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 66,
              lineHeight: 1.08,
              fontWeight: 800,
              maxWidth: 960,
            }}
          >
            A better future, built together.
          </div>
          <div style={{ fontSize: 30, color: "#d5e8e9" }}>
            Opportunities • Learning • Work • Community support
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#d5e8e9",
          }}
        >
          <span>Real opportunities. Human dignity.</span>
          <span>humanity-one-wc35.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
