import Link from "next/link";
import type { Metadata } from "next";
import { DocumentPage, PageScaffold } from "../components/PageScaffold";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
  jsonLd,
  siteConfig,
} from "../lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "夜に虫が飛びやすい条件",
  description:
    "夜間昆虫が飛びやすい気温、湿度、雨、風、月明かり、季節の見方を説明します。",
  path: "/conditions",
});

const faqItems = [
  {
    question: "夜虫指数が高い日は必ず虫が多く見られますか？",
    answer:
      "夜虫指数は観察条件の良さを示す目安です。実際の出現数は周辺環境、時期、直前の天候、観察時間によって変わります。",
  },
  {
    question: "気温と湿度はどのくらい重要ですか？",
    answer:
      "十分に暖かく、湿度が高い夜は飛翔条件が良くなりやすいです。気温が低い場合は、他の条件が良くても指数が上がりにくくなります。",
  },
  {
    question: "月明かりは指数に影響しますか？",
    answer:
      "月が高く明るく、雲が少ない場合は月明かりの影響を減点として扱います。雲量が多い夜は月明かりの影響を弱めて見ます。",
  },
] as const;

export default function ConditionsPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "夜に虫が飛びやすい条件",
        url: absoluteUrl("/conditions"),
        description:
          "夜間昆虫が飛びやすい気温、湿度、雨、風、月明かり、季節の見方を説明します。",
        inLanguage: "ja",
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      createBreadcrumbJsonLd([
        { name: siteConfig.name, path: "/" },
        { name: "夜に虫が飛びやすい条件", path: "/conditions" },
      ]),
    ],
  };

  return (
    <PageScaffold>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(pageJsonLd) }}
      />
      <DocumentPage kicker="CONDITIONS" title="夜に虫が飛びやすい条件">
        <p>
          夜間昆虫の飛びやすさは、気温、湿度、雨、風、月明かり、季節が重なって決まります。夜虫指数では、具体的な観察地点ではなく広域エリアの気象条件から、今夜の見やすさを推定します。
        </p>

        <h2>見やすくなりやすい夜</h2>
        <ul>
          <li>夜 19:00-23:00 に十分な気温がある</li>
          <li>湿度が高めで、乾きすぎていない</li>
          <li>観察時間帯の雨が弱い、または降っていない</li>
          <li>風速や突風が弱く、飛翔を妨げにくい</li>
          <li>月明かりの影響が小さい、または雲で弱まっている</li>
          <li>季節的に夜間飛翔昆虫が活動しやすい時期に入っている</li>
        </ul>

        <h2>指数を見る時の注意</h2>
        <p>
          高い指数は「出現数の保証」ではありません。指数は観察条件の目安で、実際の見え方はエリア内の広い環境差、直前の天候、時間帯によって変わります。具体的な街灯、採集地、生息地を示すものではありません。
        </p>

        <h2>分類別の見方</h2>
        <p>
          総合スコアに加えて、蛾、甲虫、水辺の羽虫の分類別スコアを表示します。分類別スコアは、総合条件に対してそれぞれの感度差を足した補助的な目安です。
        </p>

        <h2>よくある質問</h2>
        <div className="faq-list">
          {faqItems.map((item) => (
            <section className="faq-item" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </section>
          ))}
        </div>

        <div className="document-link-panel">
          <Link href="/scoring">スコアの詳しい計算を見る</Link>
          <Link href="/data-sources">データソースを見る</Link>
        </div>
      </DocumentPage>
    </PageScaffold>
  );
}
