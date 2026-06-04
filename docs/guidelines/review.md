# Review Guidelines

## Priority

1. 地点情報や正確な位置情報が漏れていないか
2. スコア計算の責務が `packages/core` から漏れていないか
3. API が公開してよい情報だけを返しているか
4. text / layout が狭幅で破綻しないか
5. テスト、型、lint、build が通っているか

## UI

- 色や余白が `globals.css` の共通 token から外れていないか
- 同じ構造がコンポーネント化できないか
- 表示情報が長くなったときに折り返し/省略方針があるか

## API

- `latitude` / `longitude` をレスポンスに含めていないか
- 外部 API 失敗時に画面/API が落ちないか
- fallback が精度評価用データとして扱われていないか
