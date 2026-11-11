# API Design

API は Next.js Route Handlers で実装しています。レスポンスは具体的な観察地点や正確な緯度経度を返しません。

## `GET /api/areas`

エリア検索 API。

Query:

- `q`: エリア検索文字列。未指定の場合は登録済みエリアを返す。

Example:

```txt
GET /api/areas?q=奥多摩
```

Response:

```json
{
  "areas": [
    {
      "id": "tokyo-tama-20km-01",
      "name": "東京都 多摩エリア",
      "region": "関東",
      "prefecture": "東京都",
      "precision": "coarse_area",
      "precisionKm": 20,
      "locationPolicy": "no_points"
    }
  ]
}
```

## `GET /api/forecast`

1 日分の夜虫指数を返す API。

Query:

- `areaId`: 粗いエリア ID。未指定時は `tokyo-tama-20km-01`。
- `date`: `YYYY-MM-DD`。未指定時は Asia/Tokyo の今日。

Example:

```txt
GET /api/forecast?areaId=tokyo-tama-20km-01&date=2026-06-04
```

Response fields:

- `area`: 公開可能な粗いエリア情報
- `season`: 対象エリア・対象月の `monthlyMeanTemperatureC`（月平均気温の平年値の目安、℃）、`factor`（季節係数）、`activity`（`veryLow` / `low` / `moderate` / `high`）。週間予報の各日にも同じ形式で返す。
- `status`: `available` / `partial` / `unavailable`。以下の利用可能性を表す。
- `dataSource`: `open-meteo`（レスポンスを処理できた）/ `unavailable`（取得処理が失敗）。有効な時間帯がない場合でも取得成功時は `open-meteo`。
- `availableHours` / `expectedHours`: 算出できた時間帯数 / 対象時間帯数（5）
- `dataNotice`: 部分欠測または算出不可の説明。全時間帯を算出できれば `null`。
- `modelVersion`: `heuristic-v0.2`
- `calibration`: `uncalibrated`。実観測から確率や係数を校正していない。
- `score`: 取得できた時間帯のうち最も高い総合スコア。算出不可なら `null`。
- `label`: スコアラベル。算出不可なら `null`。
- `bestTime`: 取得できた時間帯内のおすすめ時間。算出不可なら `null`。
- `probabilityBand`: 廃止予定の互換フィールド。常に `null`。出現確率として使わない。
- `hourly`: 19:00-20:00 から 23:00-翌00:00 までのうち、算出できた時間帯だけを返す。
- `taxa`: 分類別スコア。算出不可なら `null`。
- `reasons`: スコア理由
- `condition`: 代表時間帯の条件。算出不可なら `null`。時刻の意味は下記を参照。
- `generatedAt`: この指数を計算した日時。気象モデルの発表時刻や気象データの実測時刻ではない。
- `notice`: 地点情報を表示しない旨の注意

### 利用可能性と欠測

| `status`      | 算出できた時間帯 | 意味                                                      |
| :------------ | :--------------- | :-------------------------------------------------------- |
| `available`   | 5                | 対象の全時間帯を算出できた                                |
| `partial`     | 1-4              | 一部欠測。`bestTime` は返却された時間帯の中だけで選んだ値 |
| `unavailable` | 0                | 取得失敗または必要条件の欠測で算出できない                |

`available` は予測が的中する保証や信頼度ではありません。直近24時間の履歴が不足する場合、その時間帯を算出対象から除外します。返却された `condition.recentRainMm24h` / `hourly[].recentRainMm24h` は24時間分が揃った数値です。

`unavailable` では `score` / `label` / `bestTime` / `taxa` / `condition` を `null`、`hourly` を空配列として返します。取得失敗を「0点の悪条件」として扱わず、架空の天気による代替予報も返しません。

1日予報が `unavailable` の場合はHTTP 503、`available` / `partial` は200を返します。週間予報は全日が `unavailable` なら503、1日でも算出できれば200です。HTTP状態だけでなく日ごとの `status` を確認してください。

### 時刻と区間

すべての予報対象時刻は Asia/Tokyo 基準です。`condition.time` / `hourly[].time` は観察時間帯の開始時刻、`intervalEnd` は終端です。例えば19:00-20:00なら、気温・湿度・風速・雲量・月条件は19:00、降水量と突風は区間終端の20:00に対応する値を使います。降水量は区間の合計、突風は区間の最大値です。

直近24時間雨量は開始時刻 `t` までの `(t-24h, t]` に対応する24個の時間雨量から求めます。これから観察する1時間の雨量とは重複しません。詳細は [data-sources.md](data-sources.md) を参照してください。

## `GET /api/forecast/week`

7 日分の夜虫指数を返す API。
Open-Meteo は起点日の前日から最終予報日の翌日までを1回で取得し、日別にスコア化します。最終日の23:00-翌00:00を評価するため、翌日の00:00が必要です。各日の要素は上記の利用可能性・欠測規約に従います。

Query:

- `areaId`: 粗いエリア ID。未指定時は `tokyo-tama-20km-01`。
- `date`: `YYYY-MM-DD`。未指定時は Asia/Tokyo の今日。この日を起点に 7 日分を返す。

Example:

```txt
GET /api/forecast/week?areaId=tokyo-tama-20km-01&date=2026-06-04
```

Response:

```json
{
  "area": {
    "id": "tokyo-tama-20km-01",
    "name": "東京都 多摩エリア",
    "region": "関東",
    "prefecture": "東京都",
    "precision": "coarse_area",
    "precisionKm": 20,
    "locationPolicy": "no_points"
  },
  "date": "2026-06-04",
  "forecasts": []
}
```
