import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ForecastDashboard,
  WeeklyForecastList,
} from "./components/ForecastDashboard";
import { PageScaffold } from "./components/PageScaffold";
import { DEFAULT_AREA_ID } from "./lib/constants";
import { buildWeeklyForecast } from "./lib/forecast";
import { todayKey } from "./lib/format";
import { createPageMetadata, jsonLd, siteConfig } from "./lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  description:
    "夜間昆虫が今夜飛びやすいかを、気象条件と月明かりからエリア単位で推定します。",
  path: "/",
});

export default async function Home() {
  const forecasts = await buildWeeklyForecast(DEFAULT_AREA_ID, todayKey());
  const forecast = forecasts[0];

  if (!forecast) {
    notFound();
  }

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: "ja",
    mainEntity: {
      "@type": "Dataset",
      name: `${forecast.area.name}の夜虫指数`,
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
    },
  };

  return (
    <PageScaffold>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(pageJsonLd) }}
      />
      <p className="lead">
        気温、湿度、風、雨、雲量、月明かりから、今夜このエリアで夜間昆虫が飛びやすいかを推定します。
      </p>

      <ForecastDashboard forecast={forecast} />
      <WeeklyForecastList forecasts={forecasts} />
    </PageScaffold>
  );
}
