import type { Metadata } from "next";
import { DocumentPage, PageScaffold } from "../components/PageScaffold";
import { createPageMetadata } from "../lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "スコアの考え方",
  description:
    "夜虫指数が気温、湿度、風、雨、雲量、月明かりなどをどのように加点・減点しているかを説明します。",
  path: "/scoring",
});

export default function ScoringPage() {
  return (
    <PageScaffold>
      <DocumentPage kicker="SCORING" title="スコアの考え方">
        <p>
          夜虫指数は、夜間に飛翔する昆虫の観察しやすさを 0-100
          で表すルールベースの指数です。
        </p>

        <h2>主な入力</h2>
        <ul>
          <li>気温、湿度、降水量、風速、突風、雲量</li>
          <li>月照度、月高度、雲量による月明かりの見え方</li>
          <li>季節スコア、生息環境スコア、直近 24 時間雨量</li>
        </ul>

        <h2>加点・減点</h2>
        <ul>
          <li>暖かく湿度が高いほど加点</li>
          <li>強風、突風、観察時間中の降水は減点</li>
          <li>月が高く明るい場合は減点</li>
          <li>雲量が多い場合は月明かりの影響を弱める</li>
        </ul>

        <h2>分類別スコア</h2>
        <ul>
          <li>蛾は、生息環境スコアを総合スコアより少し強めに反映</li>
          <li>甲虫は、総合スコアから少し下げた上で気温の影響を反映</li>
          <li>水辺の羽虫は、直近 24 時間雨量と生息環境スコアを追加で反映</li>
        </ul>

        <p>
          分類別スコアは、総合スコアに分類群ごとの追加補正をかけた目安です。
          総合スコアにも気温、雨量、生息環境は含まれるため、分類別では感度差を出すために意図的に追加補正しています。
        </p>
      </DocumentPage>
    </PageScaffold>
  );
}
