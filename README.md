# yoru-mushi-index

夜虫指数は、夜間に飛翔する昆虫の観察コンディションをエリア単位で推定する Web アプリです。

具体的な観察地点、街灯、採集地、生息地は表示しません。気温、湿度、風、雨、雲量、月条件、季節、広域環境から「今夜このエリアで虫が飛びやすいか」を 0-100 の指数として表示します。

## Features

- 対応エリアの選択
- 今日の 19-23 時の夜虫指数
- 7 日分の指数
- 時間別スコア
- スコア理由
- 分類別スコア
- 取得条件表示
- 指数カードの画像共有
- 地点情報ポリシー、スコア、データソース説明ページ

## Routes

```txt
/                         地方別のエリア選択
/areas                    地方別のエリア選択
/area/[areaId]            エリア別の今日の指数 / 7 日分の指数
/policy                   地点情報ポリシー
/scoring                  スコア説明
/data-sources             データソース説明
```

## API

```txt
GET /api/areas?q=奥多摩
GET /api/forecast?areaId=tokyo-tama-20km-01&date=2026-06-04
GET /api/forecast/week?areaId=tokyo-tama-20km-01&date=2026-06-04
```

## Architecture

```txt
apps/
  web/              Next.js app, pages, route handlers, and UI components
packages/
  core/             Scoring, labels, reasons, and domain types
  weather/          Open-Meteo client and response normalization
  astro/            SunCalc wrapper for moon conditions
  area/             Coarse area fixtures and privacy-safe area resolution
  shared/           Small shared utilities
docs/
  architecture.md
  development.md
  screens.md
  api-design.md
  data-sources.md
  location-policy.md
  scoring.md
  release-checklist.md
  open-questions.md
  guidelines/
  decision-log/
```

## Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm format
```

Makefile shortcuts:

```bash
make check
make dev
```

## Environment

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

`NEXT_PUBLIC_SITE_URL` is used for canonical URLs, Open Graph URLs, robots.txt, and sitemap.xml.

## CI

GitHub Actions runs on pull requests and pushes to `main`.

CI checks:

- `pnpm format:check`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

## Documentation

- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Screens](docs/screens.md)
- [API Design](docs/api-design.md)
- [Scoring](docs/scoring.md)
- [Data Sources](docs/data-sources.md)
- [Location Policy](docs/location-policy.md)
- [Release Checklist](docs/release-checklist.md)
- [Open Questions](docs/open-questions.md)
- [Guidelines](docs/guidelines/README.md)
- [Decision Log](docs/decision-log/README.md)
