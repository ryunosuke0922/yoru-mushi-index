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

## Production

- [ ] `https://yorumushi.com/` が 200 を返す
- [ ] `https://www.yorumushi.com/` が `https://yorumushi.com/` へ redirect する
- [ ] Vercel の primary domain が `yorumushi.com`
- [ ] `NEXT_PUBLIC_SITE_URL=https://yorumushi.com`
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` が Production に設定済み
- [ ] Google Analytics タグが本番 HTML に出力されている

## API

- [ ] `/api/areas?q=奥多摩`
- [ ] `/api/forecast?areaId=tokyo-tama-20km-01`
- [ ] `/api/forecast/week?areaId=tokyo-tama-20km-01`
- [ ] `/api/forecast` の未指定日付が Asia/Tokyo の今日になる

## SEO

- [ ] canonical URL が `https://yorumushi.com` を指す
- [ ] OG URL / Twitter image URL が `https://yorumushi.com` を指す
- [ ] `/robots.txt` が `https://yorumushi.com/sitemap.xml` を指す
- [ ] `/sitemap.xml` に公開ページが含まれる

## Location Safety

- [ ] UI に具体的な観察地点、街灯、採集地、生息地が出ていない
- [ ] API に `latitude` / `longitude` が含まれていない
- [ ] location policy が画面と docs にある

## Data

- [ ] Open-Meteo failure 時に算出不可として扱い、架空の指数や0点を表示しない
- [ ] 部分欠測を明示し、取得できた時間帯の範囲内でおすすめを選ぶ
- [ ] 雨・突風が表示区間に対応し、23:00-翌00:00も評価できる
- [ ] 直近24時間雨量の24値が揃わなければ、その時間帯を算出しない
- [ ] UIに百分率の見込みを出さず、APIの`probabilityBand`は`null`
- [ ] 取得条件の単位が画面に表示されている
- [ ] `/` で特定地域の予報を初期表示していない
