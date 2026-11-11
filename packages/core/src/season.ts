import { clamp } from "@yoru-mushi-index/shared";

export type RegionalSeason = {
  monthlyMeanTemperatureC: number;
  factor: number;
  activity: "veryLow" | "low" | "moderate" | "high";
};

export function seasonForMonth(
  date: string,
  monthlyMeanTemperaturesC: readonly number[],
): RegionalSeason {
  const month = Number(date.slice(5, 7));
  const monthlyMeanTemperatureC = monthlyMeanTemperaturesC[month - 1];
  if (monthlyMeanTemperatureC === undefined) {
    throw new RangeError("No climate normal for the forecast month");
  }

  // Model anchors, not biological thresholds: 5 °C → 0.05, 22 °C → 1.
  const warmth = clamp((monthlyMeanTemperatureC - 5) / (22 - 5), 0, 1);
  const factor = Math.round((0.05 + 0.95 * warmth) * 100) / 100;
  return { monthlyMeanTemperatureC, factor, activity: activityLevel(factor) };
}

function activityLevel(factor: number): RegionalSeason["activity"] {
  if (factor <= 0.2) return "veryLow";
  if (factor < 0.55) return "low";
  if (factor < 0.85) return "moderate";
  return "high";
}
