import { createOgImageResponse, ogImageSize } from "./lib/ogImage";
import { siteConfig } from "./lib/seo";

export const runtime = "edge";
export const alt = siteConfig.name;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createOgImageResponse();
}
