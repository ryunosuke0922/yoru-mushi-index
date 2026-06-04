import Link from "next/link";
import type { Metadata } from "next";
import {
  areaFixtures,
  groupAreasByRegionAndPrefecture,
} from "@yoru-mushi-index/area";
import { PageIntro, PageScaffold } from "../components/PageScaffold";
import { absoluteUrl, createPageMetadata, jsonLd } from "../lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "エリアを選択",
  description:
    "全国の地方別サブエリアから、今夜の夜間昆虫の飛翔条件を確認できます。",
  path: "/areas",
});

export default function AreasPage() {
  const groupedAreas = groupAreasByRegionAndPrefecture();
  const regionEntries = Object.entries(groupedAreas).map(
    ([region, prefectures], regionIndex) => ({
      id: `region-${regionIndex + 1}`,
      name: region,
      prefectures: Object.entries(prefectures).map(
        ([prefecture, areas], prefectureIndex) => ({
          id: `prefecture-${regionIndex + 1}-${prefectureIndex + 1}`,
          name: prefecture,
          areas,
        }),
      ),
    }),
  );
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

      <nav className="area-jump-nav" aria-label="エリア一覧の移動">
        <div className="area-jump-row" aria-label="地方">
          {regionEntries.map((region) => (
            <a href={`#${region.id}`} key={region.id}>
              {region.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="area-groups">
        {regionEntries.map((region) => (
          <section
            className="area-group"
            aria-labelledby={region.id}
            key={region.id}
          >
            <h2 id={region.id}>{region.name}</h2>
            <div className="prefecture-groups">
              {region.prefectures.map((prefecture) => (
                <section
                  className="prefecture-group"
                  aria-labelledby={prefecture.id}
                  key={prefecture.id}
                >
                  <h3 id={prefecture.id}>{prefecture.name}</h3>
                  <div className="area-list">
                    {prefecture.areas.map((area) => (
                      <Link
                        className="area-card"
                        href={`/area/${area.id}`}
                        key={area.id}
                      >
                        <span>
                          {area.name.replace(`${area.prefecture} `, "")}
                        </span>
                        <small>{area.aliases.slice(0, 4).join(" / ")}</small>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageScaffold>
  );
}
