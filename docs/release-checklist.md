# Release Checklist

## Quality Gate

- [ ] `pnpm format:check`
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] GitHub Actions CI が green

## Screens

- [ ] `/`
- [ ] `/areas`
- [ ] `/area/tokyo-tama-20km-01`
- [ ] `/area/shizuoka-west-20km-01`
- [ ] `/policy`
- [ ] `/scoring`
- [ ] `/data-sources`

## API

- [ ] `/api/areas?q=奥多摩`
- [ ] `/api/forecast?areaId=tokyo-tama-20km-01`
- [ ] `/api/forecast/week?areaId=tokyo-tama-20km-01`
- [ ] `/api/forecast` の未指定日付が Asia/Tokyo の今日になる

## Location Safety

- [ ] UI に具体的な観察地点、街灯、採集地、生息地が出ていない
- [ ] API に `latitude` / `longitude` が含まれていない
- [ ] location policy が画面と docs にある

## Data

- [ ] Open-Meteo failure 時に fallback で画面/API が落ちない
- [ ] fallback を精度評価データとして扱っていない
- [ ] 取得条件の単位が画面に表示されている
