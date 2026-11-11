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
    question: "夜に虫が多い時間帯はいつですか？",
    answer:
      "夜虫指数では、各エリアの19時から翌0時までを1時間ずつ比べ、昆虫観察に最も条件のよい時間帯を表示します。例えば19時台に雨が降り、21時台に雨がやんで風が弱まれば、21時台の方が高い指数になることがあります。実際に虫が多い時間は種類や季節によって変わり、午前0時以降はこの予報の対象外です。",
  },
  {
    question: "夜虫指数が高い日は必ず虫が多く見られますか？",
    answer:
      "夜虫指数は観察条件の良さを示す目安です。実際の出現数は周辺環境、時期、直前の天候、観察時間によって変わります。",
  },
  {
    question: "気温と湿度はどのくらい重要ですか？",
    answer:
      "気温は活動に関係しますが、好適な温度や湿度の影響は虫の種類、地域、季節によって異なります。現在の指数では気温と湿度に暫定的な配点を使っており、観測記録で検証する予定です。",
  },
  {
    question: "月明かりは指数に影響しますか？",
    answer:
      "月が地平線上で明るく、雲が少ない場合に減点します。これは灯火に集まる虫の見つけやすさを想定した暫定補正です。自然の飛翔活動と灯火への集まり方は区別する必要があります。",
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
      <DocumentPage title="夜に虫が飛びやすい条件">
        <p>
          夜間昆虫の観察しやすさは、虫の種類や発生時期、気象、観察方法によって変わります。夜虫指数では広域エリアの気象条件から、今夜の観察条件を参考値として推定します。
        </p>

        <h2>見やすくなりやすい夜</h2>
        <ul>
          <li>夜 19:00〜翌 0:00 に、対象の虫が活動できる気温がある</li>
          <li>湿度や乾燥の影響を、虫の種類や周辺環境と合わせて判断する</li>
          <li>観察時間帯の雨が弱い、または降っていない</li>
          <li>風速や突風が弱く、飛翔を妨げにくい</li>
          <li>灯火観察では、月明かりによる見つけやすさの変化も考慮する</li>
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
          <Link href="/">今夜の観察時間をエリア別に見る</Link>
          <Link href="/scoring">スコアの詳しい計算を見る</Link>
          <Link href="/data-sources">データソースを見る</Link>
        </div>
      </DocumentPage>
    </PageScaffold>
  );
}
