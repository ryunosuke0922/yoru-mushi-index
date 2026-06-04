# 0001. Next.js monorepo

| Item   | Value      |
| :----- | :--------- |
| Status | Accepted   |
| Date   | 2026-06-04 |

## Context

MVP では画面、API、スコア計算、外部 API 正規化を小さく始めたい。一方で、スコア計算は将来的に CLI、batch、mobile、ML 補正に流用する可能性がある。

## Options

### Single Next.js app

- Pros: 初期実装が速い
- Cons: スコア計算や外部 API 正規化が UI/API と密結合になりやすい

### pnpm monorepo with Next.js app and packages

- Pros: `core` / `weather` / `astro` / `area` の責務を分離できる
- Cons: workspace と TypeScript 設定が少し増える

## Decision

pnpm monorepo with Next.js app and packages を採用する。

## Consequences

- `apps/web` は UI と route handler に集中する
- スコア計算は `packages/core` に閉じる
- Open-Meteo の形式は `packages/weather` で正規化する
- エリア粗化と公開可能フィールドは `packages/area` に閉じる
