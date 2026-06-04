import type { AreaCondition, MoonCondition, WeatherHour } from "./types";

export function scoreReasons(
  weather: WeatherHour,
  moon: MoonCondition,
  area: AreaCondition,
): string[] {
  const reasons: string[] = [];

  if (weather.temperature >= 23) {
    reasons.push("気温が高めです");
  } else if (weather.temperature <= 16) {
    reasons.push("気温が低く、飛翔は鈍りやすいです");
  }

  if (weather.windSpeed <= 2.5 && weather.windGust <= 5) {
    reasons.push("風が弱いです");
  } else if (weather.windSpeed >= 5 || weather.windGust >= 9) {
    reasons.push("風が強く、飛翔には不向きです");
  }

  if (area.recentRainMm24h >= 3 && weather.precipitation < 1) {
    reasons.push("直近の雨で湿り気があります");
  } else if (weather.precipitation >= 1) {
    reasons.push("観察時間帯に雨が予想されています");
  }

  if (weather.humidity >= 70) {
    reasons.push("湿度が高めです");
  }

  if (
    moon.illumination >= 0.7 &&
    moon.altitudeDeg > 10 &&
    weather.cloudCover < 40
  ) {
    reasons.push("月明かりの影響が大きめです");
  } else if (moon.altitudeDeg > 0) {
    reasons.push("月明かりの影響が小さめです");
  } else {
    reasons.push("月明かりの影響はほぼありません");
  }

  return reasons;
}
