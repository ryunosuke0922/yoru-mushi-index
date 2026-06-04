# Data Sources

## Weather

天気予報は Open-Meteo API の hourly forecast を利用します。

利用変数:

- `temperature_2m`
- `relative_humidity_2m`
- `precipitation`
- `wind_speed_10m`
- `wind_gusts_10m`
- `cloud_cover`

風速は `wind_speed_unit=ms` を指定し、アプリ上では `m/s` として表示します。
直近 24 時間雨量を計算するため、予報生成では対象日の前日から対象日までの hourly forecast を取得します。

## Moon

月条件は SunCalc で計算します。

利用値:

- 月照度
- 月相
- 月高度

スコア計算では、月が地平線より上にあり、照度が高く、雲量が少ない場合に月明かりの影響を大きく見ます。月相は取得条件として表示します。

## Fallback

Open-Meteo が失敗した場合でも画面と API が落ちないように、アプリ内の fallback weather を使います。fallback は MVP の表示継続用であり、精度評価には使いません。
