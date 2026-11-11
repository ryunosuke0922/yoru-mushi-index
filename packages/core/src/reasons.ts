import type {
  AreaCondition,
  MoonCondition,
  ScoreReason,
  ScoreReasonTone,
  WeatherHour,
} from "./types";
import { moonEffect } from "./score";

export function scoreReasons(
  weather: WeatherHour,
  moon: MoonCondition,
  area: AreaCondition,
): ScoreReason[] {
  const reasons: ScoreReason[] = [];

  if (weather.temperature >= 24) {
    reasons.push(reason("気温が高めです", "positive"));
  } else if (weather.temperature >= 22) {
    reasons.push(reason("比較的暖かい気温です", "positive"));
  } else if (weather.temperature < 18) {
    reasons.push(reason("気温が低く、飛翔は鈍りやすいです", "negative"));
  } else if (weather.temperature < 20) {
    reasons.push(reason("気温はやや低めです", "negative"));
  }

  if (area.season.activity === "veryLow") {
    reasons.push(reason("季節的に飛翔はかなり鈍りやすい時期です", "negative"));
  } else if (area.season.activity === "low") {
    reasons.push(reason("季節的に飛翔はやや控えめな時期です", "negative"));
  } else if (area.season.activity === "high") {
    reasons.push(reason("季節的に飛翔しやすい時期です", "positive"));
  }

  if (weather.windSpeed <= 2 && weather.windGust <= 4) {
    reasons.push(reason("風が弱いです", "positive"));
  } else if (weather.windSpeed <= 4 && weather.windGust <= 7) {
    reasons.push(reason("風は比較的穏やかです", "positive"));
  } else if (weather.windSpeed <= 6 && weather.windGust <= 10) {
    reasons.push(reason("風がやや強めです", "negative"));
  } else {
    reasons.push(reason("風が強いです", "negative"));
  }

  if (weather.precipitation >= 0.5) {
    reasons.push(reason("観察時間帯に雨が予想されています", "negative"));
  } else if (area.recentRainMm24h >= 1) {
    reasons.push(reason("直近の雨による湿り気を見込んでいます", "positive"));
  } else {
    reasons.push(reason("直近の雨量は少なめです", "neutral"));
  }

  if (weather.humidity >= 65) {
    reasons.push(
      reason("高めの湿度は、一部の虫には好条件と考えられます", "positive"),
    );
  } else if (weather.humidity < 50) {
    reasons.push(reason("乾燥による活動の低下を見込んでいます", "negative"));
  } else {
    reasons.push(reason("湿度は中程度です", "neutral"));
  }

  const effect = moonEffect(moon, weather.cloudCover);
  if (moon.altitudeDeg <= 0) {
    reasons.push(reason("月明かりの影響はほぼありません", "positive"));
  } else if (effect === "large") {
    reasons.push(reason("月明かりの影響が大きめです", "negative"));
  } else if (effect === "medium") {
    reasons.push(reason("月明かりの影響があります", "negative"));
  } else {
    reasons.push(reason("月明かりの影響が小さめです", "neutral"));
  }

  return reasons;
}

function reason(text: string, tone: ScoreReasonTone): ScoreReason {
  return { text, tone };
}
