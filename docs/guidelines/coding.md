# Coding Guidelines

## TypeScript

- TypeScript strict を前提にする
- `any` は原則使わない
- 外部 API のレスポンス形式は `packages/weather` など境界 package で正規化する
- スコア計算は `packages/core` に閉じ、UI へ直接ロジックを置かない

## Next.js

- 画面共通構造は `app/components` に集約する
- API route は `app/api/**/route.ts` に置く
- 日付はユーザー表示・API default ともに Asia/Tokyo 基準を使う
- 内部リンクは `next/link` を使う

## UI

- 色は `globals.css` の CSS variables を使う
- OG / Twitter 画像や Canvas 生成など TS 側で色を使う場合は `app/lib/designTokens.ts` を使う
- カード半径、セクション間隔など共通化できる値は CSS variables に置く
- 具体的な地点名、街灯、正確な緯度経度は UI に出さない

## Comments

- WHAT を説明するコメントは避ける
- WHY が必要な制約、fallback、回避策にだけ短く書く
