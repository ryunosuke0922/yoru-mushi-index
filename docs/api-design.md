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
- `score`: 代表時間帯の総合スコア
- `label`: スコアラベル
- `bestTime`: おすすめ時間
- `probabilityBand`: 期待度の目安
- `hourly`: 19-23 時の時間別スコアと取得条件
- `taxa`: 分類別スコア
- `reasons`: スコア理由
- `condition`: 代表時間帯の取得条件
- `notice`: 地点情報を表示しない旨の注意

## `GET /api/forecast/week`

7 日分の夜虫指数を返す API。

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
