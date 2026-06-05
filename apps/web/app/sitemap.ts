import type { MetadataRoute } from "next";
import { areaFixtures } from "@yoru-mushi-index/area";
import { absoluteUrl } from "./lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/conditions", priority: 0.7 },
    { path: "/scoring", priority: 0.6 },
    { path: "/data-sources", priority: 0.6 },
  ];

  const areaRoutes = areaFixtures.map((area) => ({
    path: `/area/${area.id}`,
    priority: 0.9,
  }));

  return [...staticRoutes, ...areaRoutes].map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route.priority,
  }));
}
