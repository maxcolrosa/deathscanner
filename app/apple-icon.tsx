import { ImageResponse } from "next/og";

// Apple touch icon: the flatline-pulse mark on the dark monitor background,
// rendered at the size iOS expects. Same motif as app/icon.svg.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BG = "#070b0d";
const ACCENT = "#2ee6c9";
const ALERT = "#ff453a";

const pulseSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="80" viewBox="0 0 140 80" fill="none"><path d="M8 44 H40 L52 14 L66 70 L80 44" stroke="${ACCENT}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M80 44 H128" stroke="${ALERT}" stroke-width="9" stroke-linecap="round"/><circle cx="128" cy="44" r="7" fill="${ALERT}"/></svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
        }}
      >
        <img
          width={140}
          height={80}
          alt=""
          src={`data:image/svg+xml,${encodeURIComponent(pulseSvg)}`}
        />
      </div>
    ),
    { ...size }
  );
}
