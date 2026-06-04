# Data Sources

## Weather

天気予報は Open-Meteo API の hourly forecast を利用します。

取得範囲:

- 対象日の 19-23 時を時間別スコアの対象にする
- 直近 24 時間雨量の計算に使うため、対象日の前日から対象日までを取得する

利用変数:

- `temperature_2m`: 気温。総合スコア、理由表示、甲虫補正に使用する。
- `relative_humidity_2m`: 湿度。総合スコアと理由表示に使用する。
- `precipitation`: 観察時間帯の降水量。観察時間中の雨による減点に使用する。
- `wind_speed_10m`: 風速。弱風の加点、強風の減点に使用する。
- `wind_gusts_10m`: 突風。突風による減点に使用する。
- `cloud_cover`: 雲量。月明かりの見え方を弱める補正に使用する。

風速は `wind_speed_unit=ms` を指定し、アプリ上では `m/s` として表示します。
直近 24 時間雨量を計算するため、予報生成では対象日の前日から対象日までの hourly forecast を取得します。現在の降水量は別項目として扱うため、直近 24 時間雨量には代表時刻の時間帯を含めません。

## Moon

月条件は SunCalc で計算します。

利用値:

- 月照度: 月明かりの影響判定に使用する。
- 月高度: 月が地平線より上にあるかの判定に使用する。
- 月相: 取得条件として表示する。総合スコアには直接渡していない。

スコア計算では、月が地平線より上にあり、照度が高く、雲量が少ない場合に月明かりの影響を大きく見ます。月相は取得条件として表示します。

## Area

エリアは `packages/area/src/areaFixtures.ts` の広域 fixture を使います。

内部利用値:

- `latitude` / `longitude`: Open-Meteo と SunCalc の計算に使う代表座標。公開 API には返さない。
- `seasonScore`: 季節による飛翔しやすさの補正。
- `habitatScore`: 広域環境による補正。総合スコアと分類別スコアに使う。

公開値:

- `id`
- `name`
- `region`
- `prefecture`
- `precision`
- `precisionKm`
- `locationPolicy`

公開 API と画面では、正確な緯度経度、具体的な観察地点、街灯、採集地、生息地を表示しません。

## Fallback

Open-Meteo が失敗した場合でも画面と API が落ちないように、アプリ内の fallback weather を使います。fallback は MVP の表示継続用であり、精度評価には使いません。

Open-Meteo の障害、API の利用上限、ネットワークエラーが発生している間は、実際の気象予報に基づく指数として正しく動作しない可能性があります。この状態では、画面と API は暫定値を返します。
