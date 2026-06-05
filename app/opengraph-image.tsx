import { ImageResponse } from "next/og";

// File-based social share image (Open Graph). Rendered on-brand in the dark
// "diagnostic monitor" palette with the flatline-pulse motif. The pulse line is
// embedded as a data-URI SVG <img> because Satori (next/og) does not reliably
// render inline <svg> shape elements.
export const alt = "Vivrun - your body has a deadline. Find out the date.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#070b0d";
const PANEL_LINE = "#16242b";
const FG = "#d7e3e6";
const MUTED = "#6b8088";
const ACCENT = "#2ee6c9";
const ALERT = "#ff453a";

const pulseSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="120" viewBox="0 0 640 120" fill="none"><path d="M8 70 H190 L222 18 L266 112 L304 70" stroke="${ACCENT}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M304 70 H612" stroke="${ALERT}" stroke-width="8" stroke-linecap="round"/><circle cx="612" cy="70" r="7" fill="${ALERT}"/></svg>`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: ACCENT,
            }}
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 12,
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            Vivrun
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 78,
                fontWeight: 700,
                lineHeight: 1.04,
                letterSpacing: -2,
                color: FG,
              }}
            >
              Your body has a deadline.
            </div>
            <div
              style={{
                fontSize: 78,
                fontWeight: 700,
                lineHeight: 1.04,
                letterSpacing: -2,
                color: ALERT,
              }}
            >
              Find out the date.
            </div>
          </div>
          <img
            width={640}
            height={120}
            alt=""
            src={`data:image/svg+xml,${encodeURIComponent(pulseSvg)}`}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${PANEL_LINE}`,
            paddingTop: 28,
            fontSize: 23,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          <div style={{ display: "flex" }}>AI longevity scan</div>
          <div style={{ display: "flex" }}>90 seconds</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
