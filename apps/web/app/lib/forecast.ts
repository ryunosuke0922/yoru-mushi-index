import { findAreaById, publicArea } from "@yoru-mushi-index/area";
import { moonConditionAt } from "@yoru-mushi-index/astro";
import {
  calculateNightInsectScore,
  calculateTaxaScores,
  moonEffect,
  probabilityBand,
  scoreLabel,
  scoreReasons,
} from "@yoru-mushi-index/core";
import {
  fetchOpenMeteoForecast,
  normalizeWeatherHours,
  recentRainMm24h,
} from "@yoru-mushi-index/weather";
import { addDays } from "./format";

const targetHours = new Set(["19", "20", "21", "22", "23"]);

export type Forecast = NonNullable<Awaited<ReturnType<typeof buildForecast>>>;
type Area = NonNullable<ReturnType<typeof findAreaById>>;
type BaseAreaCondition = {
  seasonScore: number;
  habitatScore: number;
};
type HourlyScore = ReturnType<typeof buildHourlyScores>[number];

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

function buildHourlyScores(
  weatherHours: Awaited<ReturnType<typeof fetchWeatherHours>>,
  area: Area,
  baseAreaCondition: BaseAreaCondition,
  date: string,
) {
  return weatherHours
    .filter(
      (hour) =>
        hour.time.slice(0, 10) === date &&
        targetHours.has(hour.time.slice(11, 13)),
    )
    .map((weather) => {
      const moon = moonConditionAt(
        new Date(weather.time),
        area.latitude,
        area.longitude,
      );
      const recentRain = recentRainMm24h(weatherHours, weather.time);
      const areaCondition = {
        ...baseAreaCondition,
        recentRainMm24h: recentRain,
      };
      const score = calculateNightInsectScore(weather, moon, areaCondition);

      return {
        ...weather,
        score,
        label: scoreLabel(score),
        moonEffect: moonEffect(moon, weather.cloudCover),
        moonIllumination: moon.illumination,
        moonPhase: moon.phase,
        moonAltitudeDeg: moon.altitudeDeg,
        recentRainMm24h: recentRain,
      };
    });
}

function findBestHour(hourly: HourlyScore[]) {
  return hourly.reduce(
    (best, current) => (current.score > best.score ? current : best),
    hourly[0],
  );
}

function formatBestTime(bestHour: HourlyScore) {
  return `${bestHour.time.slice(11, 16)}-${String(Number(bestHour.time.slice(11, 13)) + 1).padStart(2, "0")}:00`;
}

function toForecastCondition(bestHour: HourlyScore) {
  return {
    time: bestHour.time,
    temperature: bestHour.temperature,
    humidity: bestHour.humidity,
    precipitation: bestHour.precipitation,
    windSpeed: bestHour.windSpeed,
    windGust: bestHour.windGust,
    cloudCover: bestHour.cloudCover,
    moonIllumination: bestHour.moonIllumination,
    moonPhase: bestHour.moonPhase,
    moonAltitudeDeg: bestHour.moonAltitudeDeg,
    recentRainMm24h: bestHour.recentRainMm24h,
  };
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
  } catch {
    return fallbackWeatherHours(date);
  }
}

function fallbackWeatherHours(date: string) {
  return [addDays(date, -1), date].flatMap((dateKey) =>
    Array.from({ length: 24 }, (_, hour) => ({
      time: `${dateKey}T${String(hour).padStart(2, "0")}:00`,
      temperature: hour >= 19 && hour <= 23 ? 23.5 - (hour - 19) * 0.4 : 22,
      humidity: hour >= 19 && hour <= 23 ? 76 : 68,
      precipitation: 0,
      windSpeed: hour >= 19 && hour <= 23 ? 2 : 3,
      windGust: hour >= 19 && hour <= 23 ? 4 : 6,
      cloudCover: 72,
    })),
  );
}
