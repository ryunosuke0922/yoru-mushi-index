import { Button } from "@astryxdesign/core/Button";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { findAreaById, findNearbyAreas } from "@yoru-mushi-index/area";
import {
  ForecastDashboard,
  WeeklyForecastList,
} from "../../components/ForecastDashboard";
import { ForecastImageShareButton } from "../../components/ForecastImageShareButton";
import { ForecastShareButton } from "../../components/ForecastShareButton";
import { PageIntro, PageScaffold } from "../../components/PageScaffold";
import { buildWeeklyForecast, type Forecast } from "../../lib/forecast";
import { todayKey } from "../../lib/format";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
  jsonLd,
  siteConfig,
} from "../../lib/seo";

type AreaPageProps = {
  params: Promise<{
    areaId: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: AreaPageProps): Promise<Metadata> {
  const { areaId } = await params;
  const area = findAreaById(areaId);

  if (!area) {
    return createPageMetadata({
      title: "エリアが見つかりません",
      description: "指定されたエリアは夜虫指数に対応していません。",
      path: `/area/${areaId}`,
      robots: {
        index: false,
        follow: false,
      },
    });
  }

  return createPageMetadata({
    title: `${area.name}の夜虫指数`,
    description: `${area.name}の今夜の夜間昆虫の飛翔条件を、気象条件と月明かりから推定します。`,
    path: `/area/${area.id}`,
  });
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { areaId } = await params;
  const area = findAreaById(areaId);

  if (!area) {
    notFound();
  }

  const today = todayKey();
  const forecasts = await buildWeeklyForecast(areaId, today);
  const current = forecasts[0];
  const nearbyAreas = findNearbyAreas(area.id);

  if (!current) {
    notFound();
  }

  const shareUrl = absoluteUrl(`/area/${area.id}`);
  const shareText = [
    current.score === null
      ? `${current.area.name}の夜虫指数は、現在データを取得できません。`
      : `${current.area.name}の夜虫指数は ${current.score} / 100（${current.label}）です。`,
    current.bestTime ? `おすすめ時間は ${current.bestTime}。` : null,
    current.status === "partial"
      ? "取得できた時間帯のみで比較した、精度検証前の参考指数です。"
      : current.score !== null
        ? "精度検証前の参考指数です。"
        : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
  const nightGuide = createNightGuide(current);

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: `${area.name}の夜虫指数`,
        url: absoluteUrl(`/area/${area.id}`),
        description: `${area.name}の今夜の夜間昆虫の飛翔条件を、気象条件と月明かりから推定します。`,
        inLanguage: "ja",
        mainEntity: {
          "@type": "Dataset",
          name: `${area.name}の夜虫指数`,
          description: `${area.name}を対象に、Open-Meteo の気象予報、SunCalc の月条件、季節と広域環境の補正から、夜間昆虫が飛翔しやすい条件を日別に推定した指数データです。具体的な観察地点、街灯、採集地、生息地、内部計算用の代表座標は含みません。`,
          creator: {
            "@type": "Person",
            name: "ryuuuu092",
            sameAs: [siteConfig.xUrl, siteConfig.githubUrl],
          },
          license: {
            "@type": "CreativeWork",
            name: "夜虫指数 公開データ利用条件",
            url: absoluteUrl("/data-sources"),
          },
          variableMeasured: [
            "気温",
            "湿度",
            "風速",
            "降水量",
            "雲量",
            "月の照明割合",
            "月相",
          ],
          spatialCoverage: {
            "@type": "Place",
            name: area.name,
          },
        },
      },
      createBreadcrumbJsonLd([
        { name: siteConfig.name, path: "/" },
        { name: area.name, path: `/area/${area.id}` },
      ]),
    ],
  };

  return (
    <PageScaffold forecast={current}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(pageJsonLd) }}
      />
      <PageIntro
        action={
          <div className="page-intro-actions">
            {current.score !== null && current.label !== null ? (
              <>
                <ForecastShareButton
                  text={shareText}
                  title={`${current.area.name}の夜虫指数は ${current.score}`}
                  url={shareUrl}
                />
                <ForecastImageShareButton
                  areaName={current.area.name}
                  bestTime={current.bestTime}
                  date={current.date}
                  label={current.label}
                  partial={current.status === "partial"}
                  reasons={current.reasons}
                  score={current.score}
                  url={shareUrl}
                />
              </>
            ) : null}
            <Button href="/areas" label="エリアを選ぶ" variant="primary" />
          </div>
        }
        title={area.name}
      >
        <p className="area-aliases">{area.aliases.slice(0, 4).join(" / ")}</p>
        <p className="page-intro-description">
          夜虫指数は、今夜の気象条件と月明かりから、夜間に飛ぶ昆虫を観察しやすい時間を推定する指数です。
        </p>
        <p className="page-intro-note">
          各日の夜 19:00〜翌 0:00 を 1
          時間ごとに比較します。指数は最も条件がよい時間帯の参考値です。
        </p>
        {nearbyAreas.length > 0 ? (
          <nav className="nearby-area-nav" aria-label="近くのエリア">
            <span>近くのエリア</span>
            <div>
              {nearbyAreas.map((nearbyArea) => (
                <Link href={`/area/${nearbyArea.id}`} key={nearbyArea.id}>
                  {nearbyArea.name}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}
      </PageIntro>

      <ForecastDashboard
        forecast={current}
        showAreaLink={false}
        showAreaName={false}
      />
      <section className="data-section night-guide-section">
        <h2>今夜の見方</h2>
        <p>{nightGuide}</p>
        <Link href="/conditions">夜に虫が飛びやすい条件を見る</Link>
      </section>
      <WeeklyForecastList forecasts={forecasts} />
    </PageScaffold>
  );
}

const goodConditionsGuide = "今夜は観察条件が良い寄りです。";
const guideByLabel = {
  とても高い: goodConditionsGuide,
  高い: goodConditionsGuide,
  普通: "今夜は条件がそろう時間を選ぶと見やすい見込みです。",
  低い: "今夜は条件が伸びにくく、短時間の確認向きです。",
  とても低い: "今夜は夜間飛翔が控えめになりやすい条件です。",
} satisfies Record<NonNullable<Forecast["label"]>, string>;

function createNightGuide(current: Forecast) {
  const condition = current.condition;
  if (current.label === null || !condition) {
    return "必要な気象データがそろっていないため、今夜の観察条件は判定できません。";
  }
  const scoreGuide = guideByLabel[current.label];

  const weatherGuide =
    condition.temperature >= 22
      ? "気温は比較的高めです。好適な気温や湿度は虫の種類や時期によって異なります。"
      : condition.temperature < 18
        ? "気温が低めで、他の条件が良くても活動は抑えられやすいです。"
        : condition.humidity < 50
          ? "湿度が低めで、乾いた夜として見ます。"
          : "気温と湿度に加え、風や雨の影響も合わせて見る夜です。";

  const windRainGuide =
    condition.precipitation >= 0.5
      ? "観察時間帯の雨が減点要素です。"
      : condition.windSpeed > 4 || condition.windGust > 7
        ? "風または突風が強めで、飛翔を妨げる可能性があります。"
        : "雨と風の影響は大きくありません。";

  const moonGuide =
    condition.moonIllumination >= 0.6 &&
    condition.moonAltitudeDeg > 0 &&
    condition.cloudCover < 60
      ? "月明かりによって、灯火に集まる虫の見つけやすさが変わる可能性があります。"
      : "月明かりの補正は限定的です。";

  return `${scoreGuide}${weatherGuide}${windRainGuide}${moonGuide}指数は広域エリアの目安で、具体的な観察地点を示すものではありません。`;
}
