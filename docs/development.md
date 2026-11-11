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
pnpm audit --audit-level=high
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
- 予報取得失敗・必要条件の欠測時には算出しない。固定のfallback weatherは使わない。
- `heuristic-v0.2` の係数は未校正で、実観測に対する精度改善は未検証。
- API 検索は fixture の name / aliases に対する部分一致。

## UI の実装とレビュー

共有ボタンやリンクボタンには [Astryx](https://github.com/meta/astryx) の `Button` を使います。`DesignProvider` が Neutral テーマと Next.js のリンクを設定し、`globals.css` で夜虫指数の配色と日本語フォントを割り当てます。

画面をレビューする際は、このプロジェクトの Codex で「`$unslop` でエリア選択画面を確認」のように指定できます。同梱した [unslop](https://github.com/heydamir/unslop/tree/97daa3eb365670ea3f87ed85356cbfcee18105a5/skills/unslop) は Damir Sokolovsky 作、[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) です。
