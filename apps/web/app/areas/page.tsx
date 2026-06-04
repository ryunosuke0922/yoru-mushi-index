import type { Metadata } from "next";
import { areaFixtures } from "@yoru-mushi-index/area";
import { AreaSelector } from "../components/AreaSelector";
import { PageIntro, PageScaffold } from "../components/PageScaffold";
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
      <PageIntro kicker="AREA" title="エリアを選択">
        <p>地方別に分けた広域エリアから、今夜の飛翔条件を確認します。</p>
      </PageIntro>

      <AreaSelector />
    </PageScaffold>
  );
}
