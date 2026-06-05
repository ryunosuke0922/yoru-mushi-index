import type { CoarseArea } from "@yoru-mushi-index/area";
import { moonConditionAt } from "@yoru-mushi-index/astro";
import {
  calculateNightInsectScore,
  moonEffect,
  scoreLabel,
} from "@yoru-mushi-index/core";
import type { WeatherHour } from "@yoru-mushi-index/core";
import { recentRainMm24h } from "@yoru-mushi-index/weather";
import { addDays } from "./format";

const targetHours = new Set(["19", "20", "21", "22", "23"]);

type BaseAreaCondition = {
  seasonScore: number;
  habitatScore: number;
};

export type ForecastHourlyScore = WeatherHour & {
  score: number;
  label: ReturnType<typeof scoreLabel>;
  moonEffect: ReturnType<typeof moonEffect>;
  moonIllumination: number;
  moonPhase: number;
  moonAltitudeDeg: number;
  recentRainMm24h: number;
};

export function buildHourlyScores(
  weatherHours: WeatherHour[],
  area: CoarseArea,
  baseAreaCondition: BaseAreaCondition,
  date: string,
): ForecastHourlyScore[] {
  return weatherHours
    .filter(
      (hour) =>
        hour.time.slice(0, 10) === date &&
        targetHours.has(hour.time.slice(11, 13)),
    )
    .map((weather) => {
      const moon = moonConditionAt(
        jstDateFromOpenMeteoTime(weather.time),
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

export function findBestHour(
  hourly: ForecastHourlyScore[],
): ForecastHourlyScore | undefined {
  if (hourly.length === 0) {
    return undefined;
  }

  return hourly.reduce(
    (best, current) => (current.score > best.score ? current : best),
    hourly[0]!,
  );
}

export function formatBestTime(bestHour: ForecastHourlyScore) {
  const startHour = Number(bestHour.time.slice(11, 13));
  const endHour = (startHour + 1) % 24;

  return `${bestHour.time.slice(11, 16)}-${String(endHour).padStart(2, "0")}:00`;
}

export function toForecastCondition(bestHour: ForecastHourlyScore) {
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

export function fallbackWeatherHours(date: string): WeatherHour[] {
  return fallbackWeatherHoursRange(addDays(date, -1), date);
}

export function fallbackWeatherHoursRange(
  startDate: string,
  endDate: string,
): WeatherHour[] {
  const dates: string[] = [];
  let date = startDate;

  while (date <= endDate) {
    dates.push(date);
    date = addDays(date, 1);
  }

  return dates.flatMap((dateKey) =>
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

export function jstDateFromOpenMeteoTime(time: string) {
  return new Date(`${time}+09:00`);
}
