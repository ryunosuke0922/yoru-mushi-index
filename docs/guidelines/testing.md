# Testing Guidelines

## Required Checks

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

CI でも同じ順序で実行します。

## Unit Tests

現在は `packages/core` のスコア計算を中心にテストします。

追加優先度:

1. スコア境界値
2. 月明かり影響
3. 風速/降水の減点
4. エリア選択
5. API response shape

## Manual Smoke

```txt
/
/areas
/area/tokyo-tama-20km-01
/area/shizuoka-west-20km-01
/policy
/scoring
/data-sources
/api/forecast?areaId=tokyo-tama-20km-01
/api/forecast/week?areaId=tokyo-tama-20km-01
```

画面確認では、具体的な観察地点や正確な緯度経度が表示されていないことも確認します。
