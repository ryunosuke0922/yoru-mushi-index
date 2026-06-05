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
  fallbackWeatherHoursRange,
  findBestHour,
  formatBestTime,
  toForecastCondition,
} from "./forecastScoring";
import type { WeatherHour } from "@yoru-mushi-index/core";

const openMeteoFetchOptions = {
  next: {
    revalidate: 60 * 60,
  },
} as RequestInit & { next: { revalidate: number } };

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
  const generatedAt = new Date().toISOString();

  return buildForecastFromWeather(area, date, weatherHours, generatedAt);
}

export async function buildWeeklyForecast(areaId: string, startDate: string) {
  const area = findAreaById(areaId);

  if (!area) {
    return [];
  }

  const endDate = addDays(startDate, 6);
  const weatherHours = await fetchWeatherHours(
    area.latitude,
    area.longitude,
    startDate,
    addDays(startDate, -1),
    endDate,
  );
  const generatedAt = new Date().toISOString();

  return Array.from({ length: 7 }, (_, index) =>
    buildForecastFromWeather(
      area,
      addDays(startDate, index),
      weatherHours,
      generatedAt,
    ),
  );
}

function buildForecastFromWeather(
  area: NonNullable<ReturnType<typeof findAreaById>>,
  date: string,
  weatherHours: WeatherHour[],
  generatedAt: string,
) {
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
    generatedAt,
    notice: "具体的な観察地点、街灯、採集地、生息地は表示していません。",
  };
}

async function fetchWeatherHours(
  latitude: number,
  longitude: number,
  date: string,
  startDate = addDays(date, -1),
  endDate = date,
) {
  try {
    const forecast = await fetchOpenMeteoForecast({
      latitude,
      longitude,
      date,
      startDate,
      endDate,
      fetchOptions: openMeteoFetchOptions,
    });

    return normalizeWeatherHours(forecast);
  } catch (error) {
    console.warn("Failed to fetch Open-Meteo forecast. Using fallback.", error);
    if (startDate === addDays(date, -1) && endDate === date) {
      return fallbackWeatherHours(date);
    }

    return fallbackWeatherHoursRange(startDate, endDate);
  }
}
