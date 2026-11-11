import {
  findAreaById,
  publicArea,
  type CoarseArea,
} from "@yoru-mushi-index/area";
import {
  calculateTaxaScores,
  scoreLabel,
  scoreReasons,
  seasonForMonth,
} from "@yoru-mushi-index/core";
import {
  fetchOpenMeteoForecast,
  normalizeWeatherHours,
  type WeatherSample,
} from "@yoru-mushi-index/weather";
import { addDays } from "./format";
import {
  buildHourlyScores,
  findBestHour,
  formatBestTime,
  toForecastCondition,
} from "./forecastScoring";

const openMeteoFetchOptions = {
  next: {
    revalidate: 60 * 60,
  },
} as RequestInit & { next: { revalidate: number } };

const weeklyForecastDays = 7;

export type Forecast = ReturnType<typeof buildForecastFromWeather>;
export type ForecastStatus = "available" | "partial" | "unavailable";

type WeatherResult = {
  hours: WeatherSample[];
  source: "open-meteo" | "unavailable";
};

export async function buildForecast(areaId: string, date: string) {
  const area = findAreaById(areaId);

  if (!area) {
    return null;
  }

  const weather = await fetchWeatherHours(area, date);
  const generatedAt = new Date().toISOString();

  return buildForecastFromWeather(area, date, weather, generatedAt);
}

export async function buildWeeklyForecast(areaId: string, startDate: string) {
  const area = findAreaById(areaId);

  if (!area) {
    return [];
  }

  const lastNight = addDays(startDate, weeklyForecastDays - 1);
  const weather = await fetchWeatherHours(area, startDate, lastNight);
  const generatedAt = new Date().toISOString();

  return Array.from({ length: weeklyForecastDays }, (_, index) =>
    buildForecastFromWeather(
      area,
      addDays(startDate, index),
      weather,
      generatedAt,
    ),
  );
}

function buildForecastFromWeather(
  area: CoarseArea,
  date: string,
  weather: WeatherResult,
  generatedAt: string,
) {
  const season = seasonForMonth(date, area.monthlyMeanTemperaturesC);
  const baseAreaCondition = {
    season,
    seasonScore: area.seasonScore,
    habitatScore: area.habitatScore,
  };
  const hourly = buildHourlyScores(
    weather.hours,
    area,
    baseAreaCondition,
    date,
  );
  const bestHour = findBestHour(hourly);
  const score = bestHour?.score ?? null;
  const status: ForecastStatus =
    hourly.length === 5
      ? "available"
      : hourly.length > 0
        ? "partial"
        : "unavailable";
  const bestHourAreaCondition = bestHour
    ? {
        ...baseAreaCondition,
        recentRainMm24h: bestHour.recentRainMm24h,
      }
    : null;

  return {
    area: publicArea(area),
    date,
    season,
    status,
    dataSource: weather.source,
    availableHours: hourly.length,
    expectedHours: 5,
    modelVersion: "heuristic-v0.2",
    calibration: "uncalibrated",
    dataNotice:
      status === "unavailable"
        ? "必要な気象データを取得できないため、指数を表示できません。時間をおいて再度ご確認ください。"
        : status === "partial"
          ? `気象データのある ${hourly.length} / 5 時間帯だけを表示しています。おすすめは取得できた時間帯の中での比較です。`
          : null,
    score,
    label: score === null ? null : scoreLabel(score),
    bestTime: bestHour ? formatBestTime(bestHour) : null,
    // Deprecated: no observed event or calibration supports a percentage.
    probabilityBand: null,
    hourly,
    taxa:
      score !== null && bestHour && bestHourAreaCondition
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
  area: CoarseArea,
  firstNight: string,
  lastNight = firstNight,
): Promise<WeatherResult> {
  try {
    const forecast = await fetchOpenMeteoForecast({
      latitude: area.latitude,
      longitude: area.longitude,
      date: firstNight,
      // Rain history begins the day before; the last interval ends the next midnight.
      startDate: addDays(firstNight, -1),
      endDate: addDays(lastNight, 1),
      fetchOptions: openMeteoFetchOptions,
    });

    return { hours: normalizeWeatherHours(forecast), source: "open-meteo" };
  } catch {
    console.warn("Open-Meteo weather unavailable. No substitute data used.");
    return { hours: [], source: "unavailable" };
  }
}
