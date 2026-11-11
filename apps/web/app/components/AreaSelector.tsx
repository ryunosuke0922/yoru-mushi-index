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
      <PageIntro title="今夜の昆虫観察予報">
        <p className="page-intro-description">
          夜虫指数は、蛾や甲虫などが夜に飛びやすい条件を、気象と月明かり、地域の季節から推定します。エリアを選ぶと、今夜の観察に向いた時間と7日間の予報を確認できます。
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
