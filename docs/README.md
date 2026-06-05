# docs

このディレクトリに、プロダクト概要、設計、運用、開発ガイドラインをまとめます。

## 読み順

新規参加者向け:

1. [architecture.md](architecture.md)
2. [screens.md](screens.md)
3. [api-design.md](api-design.md)
4. [scoring.md](scoring.md)
5. [location-policy.md](location-policy.md)
6. [observation-calibration.md](observation-calibration.md)

実装時:

1. [development.md](development.md)
2. [deployment.md](deployment.md)
3. [guidelines/coding.md](guidelines/coding.md)
4. [guidelines/testing.md](guidelines/testing.md)
5. [guidelines/review.md](guidelines/review.md)
6. [decision-log/](decision-log/)

## ファイル一覧

| ファイル                                                 | 内容                            |
| :------------------------------------------------------- | :------------------------------ |
| [architecture.md](architecture.md)                       | アーキテクチャと data flow      |
| [screens.md](screens.md)                                 | 画面一覧                        |
| [api-design.md](api-design.md)                           | API 設計                        |
| [scoring.md](scoring.md)                                 | 夜虫指数の計算方針              |
| [observation-calibration.md](observation-calibration.md) | 実観測に基づく調整方針          |
| [data-sources.md](data-sources.md)                       | Open-Meteo / SunCalc / fallback |
| [location-policy.md](location-policy.md)                 | 地点情報の扱い                  |
| [development.md](development.md)                         | 開発・検証手順                  |
| [deployment.md](deployment.md)                           | Vercel / domain / analytics     |
| [release-checklist.md](release-checklist.md)             | リリース前チェック              |
| [open-questions.md](open-questions.md)                   | 未解決論点                      |
| [guidelines/](guidelines/)                               | 開発ガイドライン                |
| [decision-log/](decision-log/)                           | ADR                             |

## ドキュメント方針

- 推測で書いた内容は `【推測】` を付け、[open-questions.md](open-questions.md) に起票する
- 大きな設計判断は [decision-log/](decision-log/) に ADR として残す
- 仕様変更は該当ドキュメントを直接更新する
