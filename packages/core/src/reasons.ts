import type {
  AreaCondition,
  MoonCondition,
  ScoreReason,
  ScoreReasonTone,
  WeatherHour,
} from "./types";

export function scoreReasons(
  weather: WeatherHour,
  moon: MoonCondition,
  area: AreaCondition,
): ScoreReason[] {
  const reasons: ScoreReason[] = [];

  if (weather.temperature >= 23) {
    reasons.push(reason("気温が高めです", "positive"));
  } else if (weather.temperature <= 16) {
    reasons.push(reason("気温が低く、飛翔は鈍りやすいです", "negative"));
  }

  if (weather.windSpeed <= 2.5 && weather.windGust <= 5) {
    reasons.push(reason("風が弱いです", "positive"));
  } else if (weather.windSpeed >= 5 || weather.windGust >= 9) {
    reasons.push(reason("風が強く、飛翔には不向きです", "negative"));
  }

  if (area.recentRainMm24h >= 3 && weather.precipitation < 1) {
    reasons.push(reason("直近の雨で湿り気があります", "positive"));
  } else if (weather.precipitation >= 1) {
    reasons.push(reason("観察時間帯に雨が予想されています", "negative"));
  }

  if (weather.humidity >= 70) {
    reasons.push(reason("湿度が高めです", "positive"));
  }

  if (
    moon.illumination >= 0.7 &&
    moon.altitudeDeg > 10 &&
    weather.cloudCover < 40
  ) {
    reasons.push(reason("月明かりの影響が大きめです", "negative"));
  } else if (moon.altitudeDeg > 0) {
    reasons.push(reason("月明かりの影響が小さめです", "positive"));
  } else {
    reasons.push(reason("月明かりの影響はほぼありません", "positive"));
  }

  return reasons;
}

function reason(text: string, tone: ScoreReasonTone): ScoreReason {
  return { text, tone };
}
