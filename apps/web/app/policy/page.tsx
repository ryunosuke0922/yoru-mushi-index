import type { Metadata } from "next";
import { DocumentPage, PageScaffold } from "../components/PageScaffold";
import { createPageMetadata } from "../lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "地点情報ポリシー",
  description:
    "夜虫指数で具体的な観察地点、街灯、採集地、生息地を表示しない方針を説明します。",
  path: "/policy",
  robots: {
    index: false,
    follow: true,
  },
});

export default function PolicyPage() {
  return (
    <PageScaffold>
      <DocumentPage kicker="LOCATION POLICY" title="地点情報ポリシー">
        <p>
          このサービスは、具体的な観察地点、街灯、採集地、生息地を公開しません。
        </p>

        <h2>表示する情報</h2>
        <ul>
          <li>市区町村程度の広さ</li>
          <li>20km 程度以上の粗いエリア</li>
          <li>気象条件、月条件、時間帯別の活性指数</li>
        </ul>

        <h2>表示しない情報</h2>
        <ul>
          <li>街灯、林道名、橋名、公園内の具体地点</li>
          <li>過去の詳細観察地点</li>
          <li>希少種のリアルタイム出現情報</li>
        </ul>
      </DocumentPage>
    </PageScaffold>
  );
}
