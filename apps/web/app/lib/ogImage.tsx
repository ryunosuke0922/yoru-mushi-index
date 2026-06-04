import { ImageResponse } from "next/og";
import { OgImageContent } from "./OgImageContent";

export const ogImageSize = {
  width: 1200,
  height: 630,
} as const;

export function createOgImageResponse() {
  return new ImageResponse(<OgImageContent />, ogImageSize);
}
