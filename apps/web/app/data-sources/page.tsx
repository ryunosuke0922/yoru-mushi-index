import type { Metadata } from "next";
import { DocumentPage, PageScaffold } from "../components/PageScaffold";
import { createPageMetadata } from "../lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "データソース",
  description:
    "夜虫指数で使用している Open-Meteo の気象予報データと SunCalc の月条件データを説明します。",
  path: "/data-sources",
});

export default function DataSourcesPage() {
  return (
    <PageScaffold>
      <DocumentPage kicker="DATA SOURCES" title="データソース">
        <p>
          気象予報データは Open-Meteo、月条件は SunCalc を使って計算しています。
        </p>

        <h2>気象データ</h2>
        <ul>
          <li>temperature_2m</li>
          <li>relative_humidity_2m</li>
          <li>precipitation</li>
          <li>wind_speed_10m / wind_gusts_10m</li>
          <li>cloud_cover</li>
        </ul>

        <h2>月条件</h2>
        <ul>
          <li>月の明るさ</li>
          <li>月相</li>
          <li>月高度</li>
        </ul>
      </DocumentPage>
    </PageScaffold>
  );
}
