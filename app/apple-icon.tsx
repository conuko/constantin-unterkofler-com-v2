import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111111",
        borderRadius: "36px",
      }}
    >
      <span
        style={{
          fontSize: "80px",
          fontWeight: 700,
          color: "#f8f7f2",
          letterSpacing: "-2px",
          lineHeight: 1,
        }}
      >
        CU
      </span>
    </div>,
    { ...size },
  );
}
