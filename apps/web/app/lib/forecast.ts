import { findAreaById, publicArea } from "@yoru-mushi-index/area";
import {
  calculateTaxaScores,
  probabilityBand,
  scoreLabel,
  scoreReasons,
} from "@yoru-mushi-index/core";
import {
  fetchOpenMeteoForecast,
  normalizeWeatherHours,
} from "@yoru-mushi-index/weather";
import { addDays } from "./format";
import {
  buildHourlyScores,
  fallbackWeatherHours,
  findBestHour,
  formatBestTime,
  toForecastCondition,
} from "./forecastScoring";

export type Forecast = NonNullable<Awaited<ReturnType<typeof buildForecast>>>;

export async function buildForecast(areaId: string, date: string) {
  const area = findAreaById(areaId);

  if (!area) {
    return null;
  }

  const weatherHours = await fetchWeatherHours(
    area.latitude,
    area.longitude,
    date,
  );
  const baseAreaCondition = {
    seasonScore: area.seasonScore,
    habitatScore: area.habitatScore,
  };
  const hourly = buildHourlyScores(weatherHours, area, baseAreaCondition, date);
  const bestHour = findBestHour(hourly);
  const score = bestHour?.score ?? 0;
  const bestHourAreaCondition = bestHour
    ? {
        ...baseAreaCondition,
        recentRainMm24h: bestHour.recentRainMm24h,
      }
    : null;

  return {
    area: publicArea(area),
    date,
    score,
    label: scoreLabel(score),
    bestTime: bestHour ? formatBestTime(bestHour) : null,
    probabilityBand: probabilityBand(score),
    hourly,
    taxa:
      bestHour && bestHourAreaCondition
        ? calculateTaxaScores(score, bestHour, bestHourAreaCondition)
        : null,
    reasons:
      bestHour && bestHourAreaCondition
        ? scoreReasons(
            bestHour,
            {
              illumination: bestHour.moonIllumination,
              altitudeDeg: bestHour.moonAltitudeDeg,
            },
            bestHourAreaCondition,
          )
        : [],
    condition: bestHour ? toForecastCondition(bestHour) : null,
    notice: "具体的な観察地点、街灯、採集地、生息地は表示していません。",
  };
}

export async function buildWeeklyForecast(areaId: string, startDate: string) {
  const forecasts = await Promise.all(
    Array.from({ length: 7 }, (_, index) =>
      buildForecast(areaId, addDays(startDate, index)),
    ),
  );

  return forecasts.filter(
    (forecast): forecast is Forecast => forecast !== null,
  );
}

async function fetchWeatherHours(
  latitude: number,
  longitude: number,
  date: string,
) {
  try {
    const forecast = await fetchOpenMeteoForecast({
      latitude,
      longitude,
      date,
      startDate: addDays(date, -1),
      endDate: date,
    });

    return normalizeWeatherHours(forecast);
  } catch (error) {
    console.warn("Failed to fetch Open-Meteo forecast. Using fallback.", error);
    return fallbackWeatherHours(date);
  }
}
