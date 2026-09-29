import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/* The favicon's dot on Notebook Paper. iOS masks the icon itself and fills
 * transparency with black, so the paper runs full bleed. The blue point keeps
 * the favicon's proportion: a quarter of the dot's radius. */
export default function AppleIcon() {
  return new ImageResponse(
    // biome-ignore lint/a11y/noSvgWithoutTitle: rasterised to a PNG, where Satori would draw a <title> as text
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={180}
      height={180}
      viewBox="0 0 180 180"
    >
      <rect width={180} height={180} fill="#f8f7f2" />
      <circle cx={90} cy={90} r={60} fill="#111111" />
      <circle cx={90} cy={90} r={15} fill="#80bdfb" />
    </svg>,
    { ...size },
  );
}
