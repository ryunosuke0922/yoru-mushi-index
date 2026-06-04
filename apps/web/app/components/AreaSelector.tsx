import Link from "next/link";
import { groupAreasByRegionAndPrefecture } from "@yoru-mushi-index/area";

export function AreaSelector() {
  const groupedAreas = groupAreasByRegionAndPrefecture();
  const regionEntries = Object.entries(groupedAreas).map(
    ([region, prefectures]) => ({
      id: toAnchorId(region),
      name: region,
      prefectures: Object.entries(prefectures).map(([prefecture, areas]) => ({
        id: toAnchorId(`${region}-${prefecture}`),
        name: prefecture,
        areas,
      })),
    }),
  );

  return (
    <>
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
    </>
  );
}

function toAnchorId(value: string) {
  return encodeURIComponent(value);
}
