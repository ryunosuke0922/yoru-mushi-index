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
        <p>
          Open-Meteo の hourly forecast
          から、対象日の夜間と直近雨量判定に必要な前日分を取得します。 風速は
          m/s 指定で取得し、画面でも m/s として表示します。
        </p>
        <ul>
          <li>temperature_2m: 気温、総合スコア、甲虫補正に使用</li>
          <li>relative_humidity_2m: 湿度、総合スコアと理由表示に使用</li>
          <li>precipitation: 観察時間帯の雨による減点に使用</li>
          <li>wind_speed_10m / wind_gusts_10m: 風と突風の評価に使用</li>
          <li>cloud_cover: 月明かりの見え方の補正に使用</li>
        </ul>

        <h2>月条件</h2>
        <p>
          SunCalc
          で代表時間帯の月条件を計算します。スコアでは、月が地平線より上にあり、明るく、雲が少ない場合に月明かりの影響を強く見ます。
        </p>
        <ul>
          <li>月の明るさ: 月明かりの影響判定に使用</li>
          <li>月高度: 月が見える位置にあるかの判定に使用</li>
          <li>月相: 取得条件として表示</li>
        </ul>

        <h2>エリアデータ</h2>
        <p>
          エリアは 20km
          程度の広域単位で定義し、公開レスポンスには正確な緯度経度を返しません。内部では気象予報と月条件の計算に代表座標を使います。
        </p>
        <ul>
          <li>季節スコア: 時期による飛翔しやすさの補正</li>
          <li>生息環境スコア: 広域環境による補正</li>
          <li>代表座標: API や画面には表示しない内部計算用の値</li>
        </ul>

        <h2>fallback</h2>
        <p>
          Open-Meteo の取得に失敗した場合は、画面と API
          を落とさないためにアプリ内の fallback weather を使用します。fallback
          は表示継続用で、精度評価には使いません。Open-Meteo の障害、API
          の利用上限、ネットワークエラーが発生している間は、実際の気象予報に基づく指数として正しく動作しない可能性があります。
        </p>
      </DocumentPage>
    </PageScaffold>
  );
}
