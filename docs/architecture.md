# Architecture

このリポジトリは pnpm workspace の monorepo です。

## Workspace

```txt
apps/
  web/
packages/
  core/
  weather/
  astro/
  area/
  shared/
```

## `apps/web`

Next.js App Router のアプリです。

主な責務:

- 画面表示
- Route Handlers
- 予報生成の orchestration
- 共通 UI コンポーネント

主なファイル:

- `app/page.tsx`: 今日の指数 / 7 日分の指数
- `app/areas/page.tsx`: エリア選択
- `app/area/[areaId]/page.tsx`: エリア別の今日の指数 / 7 日分の指数
- `app/api/areas/route.ts`: エリア検索 API
- `app/api/forecast/route.ts`: 1 日予報 API
- `app/api/forecast/week/route.ts`: 7 日予報 API
- `app/lib/forecast.ts`: weather / astro / core / area をつなぐ予報生成処理
- `app/lib/forecastRequest.ts`: 予報 API の query parameter 解決
- `app/lib/format.ts`: Asia/Tokyo の日付キー生成
- `app/lib/seo.ts`: metadata / JSON-LD / social image metadata
- `app/lib/ogImage.tsx`: OG / Twitter 画像レスポンスの共通生成
- `app/lib/designTokens.ts`: TS 側で使う表示色トークン
- `app/components/ForecastImageShareButton.tsx`: 指数カードの PNG 生成 / 共有

## `packages/core`

指数計算の中心です。外部 API や UI に依存しません。

主な責務:

- 総合スコア計算
- 分類別スコア計算
- ラベル生成
- 理由生成
- domain type 定義

## `packages/weather`

Open-Meteo の取得と正規化を担当します。

外部 API のレスポンス形式をアプリ全体に直接広げず、`WeatherHour[]` に変換します。
直近 24 時間雨量は、代表時刻までの過去 24 時間だけを合算します。

## `packages/astro`

SunCalc を使った月条件の計算を担当します。

現在の利用値:

- 月照度
- 月相
- 月高度

## `packages/area`

粗いエリア定義と検索を担当します。

このサービスでは正確な緯度経度を公開表示しないため、`publicArea()` で公開可能なフィールドだけを返します。

## Data Flow

```txt
areaId + date
  ↓
area fixture lookup
  ↓
Open-Meteo hourly forecast
  ↓
previous date + target date weather hours
  ↓
WeatherHour[] normalization
  ↓
SunCalc moon conditions
  ↓
core scoring
  ↓
page / API response
```
