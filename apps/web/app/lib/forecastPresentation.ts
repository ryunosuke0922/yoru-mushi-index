import type { Forecast } from "./forecast";

type TimingForecast = Pick<Forecast, "score" | "bestTime" | "status">;

export function forecastTimeLabel(forecast: Pick<Forecast, "status">) {
  return forecast.status === "partial"
    ? "取得できた範囲で最も条件がよい時間"
    : "予報時間内で最も条件がよい時間";
}

export function forecastTimeSummary(forecast: TimingForecast) {
  if (forecast.score === null) {
    return "必要な気象データがそろわず、時間帯を比較できません。";
  }
  if (forecast.score === 0) {
    return forecast.status === "partial"
      ? "取得できた時間帯には観察に向く時間帯がありません。"
      : "この夜は観察に向く時間帯がありません。";
  }
  return `${forecastTimeLabel(forecast)}は${forecast.bestTime}（日本時間）です。`;
}
