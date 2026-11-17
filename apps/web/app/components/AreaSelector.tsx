import Link from "next/link";
import { groupAreasByRegionAndPrefecture } from "@yoru-mushi-index/area";
import { PageIntro } from "./PageScaffold";

export function AreaSelector() {
  const groupedAreas = groupAreasByRegionAndPrefecture();
  const regionEntries = Object.entries(groupedAreas).map(
    ([region, prefectures]) => ({
      name: region,
      prefectures: Object.entries(prefectures).map(([prefecture, areas]) => ({
        id: `${region}-${prefecture}`,
        name: prefecture,
        areas,
      })),
    }),
  );

  return (
    <>
      <PageIntro title="今夜の虫の飛びやすさを地域別に調べる">
        <p className="page-intro-description">
          蛾や甲虫が飛びやすい時間を、地域ごとに19時〜翌0時で予報。今夜から7日分を確認できます。地域を選び、時間帯ごとの指数を比べてください。気象と月明かり、季節による観察条件の目安です。
        </p>
      </PageIntro>
      <nav className="area-jump-nav" aria-label="エリア一覧の移動">
        <div className="area-jump-row">
          {regionEntries.map((region) => (
            <a href={`#${encodeURIComponent(region.name)}`} key={region.name}>
              {region.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="area-groups">
        {regionEntries.map((region) => (
          <section
            className="area-group"
            aria-labelledby={region.name}
            key={region.name}
          >
            <h2 id={region.name}>{region.name}</h2>
            <div className="prefecture-groups">
              {region.prefectures.map((prefecture) => (
                <div
                  className="prefecture-group"
                  id={prefecture.id}
                  key={prefecture.id}
                >
                  {prefecture.name !== region.name && (
                    <h3>{prefecture.name}</h3>
                  )}
                  <div className="area-list">
                    {prefecture.areas.map((area) => (
                      <Link
                        className="area-card"
                        href={`/area/${area.id}`}
                        key={area.id}
                        prefetch={false}
                      >
                        <span>
                          {area.name.replace(`${area.prefecture} `, "")}
                        </span>
                        <small>{area.aliases.slice(0, 4).join(" / ")}</small>
                        <span className="area-arrow" aria-hidden="true">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
