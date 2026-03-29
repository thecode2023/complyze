import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Complyze — AI Regulatory Intelligence Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0e17",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Shield icon + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
            }}
          >
            &#x2713;
          </div>
          <span
            style={{
              fontSize: "20px",
              color: "#64748b",
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
            }}
          >
            COMPLYZE
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#f8fafc",
            lineHeight: 1.15,
            marginBottom: "20px",
            textShadow: "0 0 40px rgba(59,130,246,0.2)",
          }}
        >
          AI Regulatory Intelligence
          <br />
          Platform
        </div>

        {/* Stat line */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            fontSize: "18px",
            color: "#94a3b8",
          }}
        >
          <span>
            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>42+</span> Regulations
          </span>
          <span style={{ color: "#334155" }}>|</span>
          <span>
            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>24</span> Jurisdictions
          </span>
          <span style={{ color: "#334155" }}>|</span>
          <span style={{ color: "#22c55e" }}>Open Source</span>
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "80px",
            fontSize: "16px",
            color: "#3b82f6",
            letterSpacing: "0.1em",
          }}
        >
          complyze.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
