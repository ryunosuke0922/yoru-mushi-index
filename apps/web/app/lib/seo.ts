import type { Metadata } from "next";
import type { CoarseArea } from "@yoru-mushi-index/area";

const defaultSiteUrl = "https://yorumushi.com";

function normalizeSiteUrl(value: string | undefined) {
  if (!value) {
    return defaultSiteUrl;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export const siteConfig = {
  name: "夜虫指数",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  description:
    "気温、湿度、風、雨、雲量、月明かりから、今夜このエリアで夜間昆虫が飛びやすいかを推定します。",
  locale: "ja_JP",
  xUrl: "https://x.com/ryuuuu092",
  githubUrl: "https://github.com/ryunosuke0922/yoru-mushi-index",
};

export const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: siteConfig.name,
} as const;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${siteConfig.url}${normalizedPath}`;
}

type PageMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  canonicalPath?: string;
  type?: "website" | "article";
  robots?: Metadata["robots"];
};

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  canonicalPath = path,
  type = "website",
  robots,
}: PageMetadataInput = {}): Metadata {
  const socialTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;

  return {
    title: title ?? {
      absolute: siteConfig.name,
    },
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: ["/twitter-image"],
    },
    robots,
  };
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function createAreaItemListJsonLd(
  areas: CoarseArea[],
  name = "夜虫指数 対応エリア",
) {
  return {
    "@type": "ItemList",
    name,
    itemListElement: areas.map((area, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: area.name,
      url: absoluteUrl(`/area/${area.id}`),
    })),
  };
}

export function createBreadcrumbJsonLd(
  items: Array<{
    name: string;
    path: string;
  }>,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
