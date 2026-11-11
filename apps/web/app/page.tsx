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

const title = "今夜の昆虫観察予報";
const description =
  "全国のエリア別に、蛾・甲虫などの夜虫指数と観察に向いた時間を掲載。気温、雨、風、月明かり、地域の季節をもとに、今夜から7日間の条件を確認できます。";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/",
});

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
