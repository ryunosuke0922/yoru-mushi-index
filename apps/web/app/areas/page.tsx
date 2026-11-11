import type { Metadata } from "next";
import { areaFixtures } from "@yoru-mushi-index/area";
import { AreaSelector } from "../components/AreaSelector";
import { PageScaffold } from "../components/PageScaffold";
import {
  createAreaItemListJsonLd,
  createPageMetadata,
  jsonLd,
} from "../lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "エリアを選択",
  description:
    "全国の地方別サブエリアから、今夜の夜間昆虫の飛翔条件を確認できます。",
  path: "/areas",
  canonicalPath: "/",
  robots: {
    index: false,
    follow: true,
  },
});

export default function AreasPage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    ...createAreaItemListJsonLd(areaFixtures),
  };

  return (
    <PageScaffold>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(itemListJsonLd) }}
      />
      <AreaSelector />
    </PageScaffold>
  );
}
