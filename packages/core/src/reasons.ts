import type {
  AreaCondition,
  MoonCondition,
  ScoreReason,
  ScoreReasonTone,
  WeatherHour,
} from "./types";
import { seasonalActivityScore } from "./score";

export function scoreReasons(
  weather: WeatherHour,
  moon: MoonCondition,
  area: AreaCondition,
): ScoreReason[] {
  const reasons: ScoreReason[] = [];

  if (weather.temperature >= 24) {
    reasons.push(reason("気温が高めです", "positive"));
  } else if (weather.temperature < 18) {
    reasons.push(reason("気温が低く、飛翔は鈍りやすいです", "negative"));
  } else if (weather.temperature < 22) {
    reasons.push(reason("気温はやや低めです", "negative"));
  }

  const seasonalActivity = seasonalActivityScore(weather.time);
  if (seasonalActivity <= 0.2) {
    reasons.push(reason("季節的に飛翔はかなり鈍りやすい時期です", "negative"));
  } else if (seasonalActivity < 0.55) {
    reasons.push(reason("季節的に飛翔はやや控えめな時期です", "negative"));
  } else if (seasonalActivity >= 0.85) {
    reasons.push(reason("季節的に飛翔しやすい時期です", "positive"));
  }

  if (weather.windSpeed <= 2.5 && weather.windGust <= 5) {
    reasons.push(reason("風が弱いです", "positive"));
  } else if (weather.windSpeed >= 5 || weather.windGust >= 9) {
    reasons.push(reason("風が強く、飛翔には不向きです", "negative"));
  } else if (weather.windSpeed > 4 || weather.windGust > 7) {
    reasons.push(reason("風がやや強めです", "negative"));
  }

  if (area.recentRainMm24h >= 3 && weather.precipitation < 1) {
    reasons.push(reason("直近の雨で湿り気があります", "positive"));
  } else if (weather.precipitation >= 1) {
    reasons.push(reason("観察時間帯に雨が予想されています", "negative"));
  } else if (area.recentRainMm24h < 1) {
    reasons.push(reason("直近の雨量は少なめです", "negative"));
  }

  if (weather.humidity >= 70) {
    reasons.push(reason("湿度が高めです", "positive"));
  } else if (weather.humidity < 60) {
    reasons.push(reason("湿度はやや低めです", "negative"));
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
