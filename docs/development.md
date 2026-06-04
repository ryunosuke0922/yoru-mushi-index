# Development

## Setup

```bash
pnpm install
```

## Dev Server

```bash
pnpm dev
```

Default URL:

```txt
http://localhost:3000
```

## Checks

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

または:

```bash
make check
```

## Format

```bash
pnpm format
```

## Notes

- TypeScript は strict。
- 画面と API は `apps/web`。
- スコア計算は `packages/core` に閉じる。
- Open-Meteo のレスポンス形式は `packages/weather` で正規化する。
- 正確な緯度経度や観察地点は UI/API に出さない。

## CI

`.github/workflows/ci.yml` で以下を実行します。

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Environment

Local development can use `.env.local`.

```txt
NEXT_PUBLIC_SITE_URL=https://yorumushi.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

`.env.local` is ignored by git. Public examples belong in `.env.example`.

## Current Limitations

- エリア fixture は地方別サブエリアを手動定義している。
- DB は未導入。
- fallback weather は表示継続用であり、精度評価用ではない。
- API 検索は fixture の name / aliases に対する部分一致。
