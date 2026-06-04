import type { Metadata } from "next";
import { areaFixtures } from "@yoru-mushi-index/area";
import { AreaSelector } from "./components/AreaSelector";
import { PageIntro } from "./components/PageScaffold";
import { PageScaffold } from "./components/PageScaffold";
import {
  absoluteUrl,
  createAreaItemListJsonLd,
  createPageMetadata,
  jsonLd,
  siteConfig,
} from "./lib/seo";

export const metadata: Metadata = createPageMetadata({
  description:
    "全国の地方別サブエリアから、今夜の夜間昆虫の飛翔条件を確認できます。",
  path: "/",
});

export default function Home() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: "ja",
    mainEntity: createAreaItemListJsonLd(areaFixtures),
  };

  return (
    <PageScaffold>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(pageJsonLd) }}
      />
      <PageIntro kicker="AREA" title="エリアを選択">
        <p>地方別に分けた広域エリアから、今夜の飛翔条件を確認します。</p>
      </PageIntro>

      <AreaSelector />
    </PageScaffold>
  );
}
