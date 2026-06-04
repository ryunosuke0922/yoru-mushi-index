import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { findAreaById } from "@yoru-mushi-index/area";
import {
  ForecastDashboard,
  WeeklyForecastList,
} from "../../components/ForecastDashboard";
import { ForecastImageShareButton } from "../../components/ForecastImageShareButton";
import { ForecastShareButton } from "../../components/ForecastShareButton";
import { PageIntro, PageScaffold } from "../../components/PageScaffold";
import { buildWeeklyForecast } from "../../lib/forecast";
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

  if (!current) {
    notFound();
  }

  const shareUrl = absoluteUrl(`/area/${area.id}`);
  const shareText = [
    `${current.area.name}の夜虫指数は ${current.score} / 100（${current.label}）です。`,
    current.bestTime ? `おすすめ時間は ${current.bestTime}。` : null,
    `見込みは ${current.probabilityBand}。`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

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
          description:
            "夜間昆虫の飛翔条件を気象条件と月条件から推定したエリア単位の指数です。",
          variableMeasured: [
            "気温",
            "湿度",
            "風速",
            "降水量",
            "雲量",
            "月照度",
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
    <PageScaffold>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(pageJsonLd) }}
      />
      <PageIntro
        action={
          <div className="page-intro-actions">
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
              probabilityBand={current.probabilityBand}
              reasons={current.reasons}
              score={current.score}
              url={shareUrl}
            />
            <Link
              className="area-select-link area-select-link-secondary"
              href="/areas"
            >
              エリアを選ぶ
            </Link>
          </div>
        }
        kicker="AREA FORECAST"
        title={area.name}
      >
        <p className="area-aliases">{area.aliases.slice(0, 4).join(" / ")}</p>
        <p>今日から 7 日分の夜虫指数と、各日のおすすめ時間を表示します。</p>
      </PageIntro>

      <ForecastDashboard
        forecast={current}
        showAreaLink={false}
        showAreaName={false}
      />
      <WeeklyForecastList forecasts={forecasts} />
    </PageScaffold>
  );
}
