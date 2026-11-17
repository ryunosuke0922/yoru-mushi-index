import type { Metadata } from "next";
import { areaFixtures } from "@yoru-mushi-index/area";
import { AreaSelector } from "./components/AreaSelector";
import { PageScaffold } from "./components/PageScaffold";
import {
  absoluteUrl,
  createAreaItemListJsonLd,
  createPageMetadata,
  jsonLd,
  siteConfig,
} from "./lib/seo";

const title = "今夜、虫が飛びやすい時間は？";
const description =
  "蛾や甲虫が飛びやすい時間を、地域ごとに19時〜翌0時で予報。今夜から7日分を確認できます。地域を選び、時間帯ごとの観察条件の目安を比べられます。";

export const metadata: Metadata = {
  ...createPageMetadata({ title, description, path: "/" }),
  title: { absolute: `${title} | ${siteConfig.name}` },
};

export default function Home() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: siteConfig.name,
        url: absoluteUrl("/"),
      },
      {
        "@type": "CollectionPage",
        name: title,
        url: absoluteUrl("/"),
        isPartOf: { "@id": absoluteUrl("/#website") },
        description,
        inLanguage: "ja",
        mainEntity: createAreaItemListJsonLd(areaFixtures),
      },
    ],
  };

  return (
    <PageScaffold>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(pageJsonLd) }}
      />
      <AreaSelector />
    </PageScaffold>
  );
}
