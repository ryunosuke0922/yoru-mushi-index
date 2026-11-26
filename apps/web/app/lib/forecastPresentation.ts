import type { Forecast } from "./forecast";

type TimingForecast = Pick<Forecast, "score" | "bestTime" | "status"> & {
  hourly: Pick<Forecast["hourly"][number], "score" | "time">[];
};

export function forecastTiming({
  score,
  bestTime,
  status,
  hourly,
}: TimingForecast) {
  if (score === null) {
    return {
      label: "時間帯",
      value: "データなし",
      summary: "必要な気象データがそろわず、時間帯を比較できません。",
    };
  }
  const partial = status === "partial";
  if (score === 0) {
    return {
      label: "時間帯",
      value: "該当なし",
      summary: partial
        ? "取得できた時間帯には観察に向く時間帯がありません。"
        : "この夜は観察に向く時間帯がありません。",
    };
  }
  if (hourly.length === 1) {
    return {
      label: "取得できた時間帯",
      value: bestTime,
      summary: `取得できた時間帯は${bestTime}（日本時間）のみです。`,
    };
  }
  const highest = hourly.filter((hour) => hour.score === score);
  if (highest.length === hourly.length) {
    const scope = partial ? `取得できた${hourly.length}時間帯` : "全時間帯";
    return {
      label: "時間帯ごとの指数",
      value: `${scope}で同点`,
      summary: `${scope}で同じ${score}点です。`,
    };
  }
  const label = partial
    ? "取得できた範囲で最も条件がよい時間"
    : "予報時間内で最も条件がよい時間";
  const value =
    highest.length > 1
      ? highest.map((hour) => `${hour.time.slice(11, 13)}時台`).join("・")
      : bestTime;
  return { label, value, summary: `${label}は${value}（日本時間）です。` };
}
