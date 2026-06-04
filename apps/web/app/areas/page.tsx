import type { Metadata } from "next";
import { areaFixtures } from "@yoru-mushi-index/area";
import { AreaSelector } from "../components/AreaSelector";
import { PageIntro, PageScaffold } from "../components/PageScaffold";
import { absoluteUrl, createPageMetadata, jsonLd } from "../lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "エリアを選択",
  description:
    "全国の地方別サブエリアから、今夜の夜間昆虫の飛翔条件を確認できます。",
  path: "/areas",
});

export default function AreasPage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "夜虫指数 対応エリア",
    itemListElement: areaFixtures.map((area, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: area.name,
      url: absoluteUrl(`/area/${area.id}`),
    })),
  };

  return (
    <PageScaffold>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(itemListJsonLd) }}
      />
      <PageIntro kicker="AREA" title="エリアを選択">
        <p>地方別に分けた広域エリアから、今夜の飛翔条件を確認します。</p>
      </PageIntro>

      <AreaSelector />
    </PageScaffold>
  );
}
