import type { MetadataRoute } from "next";
import { areaFixtures } from "@yoru-mushi-index/area";
import { absoluteUrl } from "./lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/conditions",
    "/scoring",
    "/data-sources",
    ...areaFixtures.map((area) => `/area/${area.id}`),
  ];
  return paths.map((path) => ({ url: absoluteUrl(path) }));
}
