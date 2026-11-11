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
      <DocumentPage title="データソース">
        <p>
          気象予報データは Open-Meteo、月条件は SunCalc を使って計算しています。
        </p>

        <h2>気象データ</h2>
        <p>
          Open-Meteo の hourly forecast
          から、直近雨量判定に必要な前日分と、最後の時間帯に必要な翌日分を含めて取得します。風速は
          m/s 指定で取得し、画面でも m/s
          として表示します。取得した条件は、スコアが最も高い代表時間帯の値として表示します。
          Open-Meteo への取得は 1 時間キャッシュします。
        </p>
        <ul>
          <li>temperature_2m: 気温、総合スコア、甲虫補正に使用</li>
          <li>relative_humidity_2m: 湿度、総合スコアと理由表示に使用</li>
          <li>precipitation: 観察時間帯の雨による減点に使用</li>
          <li>wind_speed_10m / wind_gusts_10m: 風と突風の評価に使用</li>
          <li>cloud_cover: 月明かりの見え方の補正に使用</li>
        </ul>
        <p>
          気温・湿度・風速・雲量は時間帯の開始時点、降水量と突風はその時間帯全体の値を使います。
          例えば 19:00〜20:00 の降水量は、API の 20:00 の値です。直近 24
          時間雨量は開始時刻までの 24 時間分を合計します。
        </p>
        <p>
          公式仕様:{" "}
          <a href="https://open-meteo.com/en/docs">
            Open-Meteo Weather Forecast API
          </a>
          。 日本では標準のモデル選択に JMA MSM
          が含まれ、時間・変数によって他のモデルで補われます。
          画面の最終計算時刻は、気象モデルの予報発表時刻を示すものではありません。
        </p>

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

        <h2>地域の気候</h2>
        <p>
          気象庁のアメダス月別平年値（1991〜2020年）をエリアごとに集計しています。帯に表示するのはその月の平均気温の目安で、今夜の気温には気象予報を使います。
          <a href="https://www.data.jma.go.jp/stats/data/mdrr/normal/index.html">
            出典：気象庁「平年値ダウンロード」
          </a>
        </p>

        <h2>エリアデータ</h2>
        <p>
          エリアは 20km
          程度の広域単位で定義し、公開レスポンスには正確な緯度経度を返しません。内部では気象予報と月条件の計算に代表座標を使います。
        </p>
        <ul>
          <li>エリア別・月別の季節係数: 平年の気温による補正</li>
          <li>エリア別の季節スコア: エリアごとの季節適性の補正</li>
          <li>生息環境スコア: 広域環境による補正</li>
          <li>代表座標: API や画面には表示しない内部計算用の値</li>
        </ul>

        <h2 id="data-usage">公開データの利用</h2>
        <p>
          夜虫指数の画面と公開 API
          で表示される指数データを利用する場合は、出典として「夜虫指数」または
          yorumushi.com
          を明記してください。具体的な観察地点、街灯、採集地、生息地、希少種のリアルタイム出現情報を推定または公開する目的での利用は避けてください。
        </p>

        <h2>気象データを取得できない場合</h2>
        <p>
          データが欠けた時間帯の指数は表示しません。すべての時間帯で必要な値がそろわない場合は「気象データを取得できません」と表示します。
          一部だけ取得できた場合は、その範囲での比較であることを明記します。
          架空の天気への置き換えや、欠測を雨量・風速ゼロとして扱う補完は行いません。
        </p>

        <h2>参考にした研究</h2>
        <p>
          次の研究はモデルを見直すための資料です。現在の点数や係数そのものが、これらの研究で検証されたわけではありません。
        </p>
        <ul>
          <li>
            <a href="https://academic.oup.com/ee/article-abstract/26/6/1283/2464426">
              Yela &amp; Holyoak（1997）
            </a>
            : 灯火と餌トラップで、月明かり・雲量の影響が異なることを報告。
          </li>
          <li>
            <a href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0092453">
              Jonason ほか（2014）
            </a>
            :
            気温、季節、光源が灯火で観測する蛾の数に関係。湿度の影響は単純な加点では表せない。
          </li>
          <li>
            <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7690004/">
              Komatsu ほか（2020）
            </a>
            : 北海道の灯火調査で、気温への応答や光源の影響に種ごとの違いを確認。
          </li>
          <li>
            <a href="https://www.pref.shizuoka.jp/sangyoshigoto/norinjimusho/1058658/boujo/hassei/yusatsu.html">
              静岡県・害虫誘殺グラフ
            </a>
            :
            地域ごとの発生時期を確認する資料。対象種や調査方法、集計期間の違いに注意して利用します。
          </li>
        </ul>
      </DocumentPage>
    </PageScaffold>
  );
}
