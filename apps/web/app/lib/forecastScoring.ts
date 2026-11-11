import type { CoarseArea } from "@yoru-mushi-index/area";
import { moonConditionAt } from "@yoru-mushi-index/astro";
import {
  calculateNightInsectScore,
  moonEffect,
  scoreLabel,
} from "@yoru-mushi-index/core";
import type {
  AreaCondition,
  HourlyScore,
  WeatherHour,
} from "@yoru-mushi-index/core";
import { recentRainMm24h, type WeatherSample } from "@yoru-mushi-index/weather";

const targetHours = new Set(["19", "20", "21", "22", "23"]);
const hourMs = 60 * 60 * 1000;

export type ForecastHourlyScore = HourlyScore & {
  intervalEnd: string;
  moonIllumination: number;
  moonPhase: number;
  moonAltitudeDeg: number;
  recentRainMm24h: number;
};

export function buildHourlyScores(
  weatherHours: WeatherSample[],
  area: CoarseArea,
  baseAreaCondition: Omit<AreaCondition, "recentRainMm24h">,
  date: string,
): ForecastHourlyScore[] {
  const weatherByTime = new Map<number, WeatherSample | null>();
  for (const weather of weatherHours) {
    const timeMs = jstDateFromOpenMeteoTime(weather.time).getTime();
    if (Number.isFinite(timeMs)) {
      weatherByTime.set(timeMs, weatherByTime.has(timeMs) ? null : weather);
    }
  }

  const hourly: ForecastHourlyScore[] = [];
  for (const weather of weatherHours) {
    if (
      weather.time.slice(0, 10) !== date ||
      !targetHours.has(weather.time.slice(11, 13))
    ) {
      continue;
    }

    const time = jstDateFromOpenMeteoTime(weather.time);
    const timeMs = time.getTime();
    const nextHour = weatherByTime.get(timeMs + hourMs);
    if (
      weatherByTime.get(timeMs) !== weather ||
      !nextHour ||
      weather.temperature === null ||
      weather.humidity === null ||
      weather.windSpeed === null ||
      weather.cloudCover === null ||
      nextHour.precipitation === null ||
      nextHour.windGust === null
    ) {
      continue;
    }

    const recentRain = recentRainMm24h(weatherHours, weather.time);
    if (recentRain === null) {
      continue;
    }

    // Rain and gusts at t+1 describe the preceding interval [t, t+1].
    // Temperature, humidity, wind speed, clouds, and moon remain at t.
    const intervalWeather: WeatherHour = {
      time: weather.time,
      temperature: weather.temperature,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      cloudCover: weather.cloudCover,
      precipitation: nextHour.precipitation,
      windGust: nextHour.windGust,
    };
    const moon = moonConditionAt(time, area.latitude, area.longitude);
    const areaCondition = {
      ...baseAreaCondition,
      recentRainMm24h: recentRain,
    };
    const score = calculateNightInsectScore(
      intervalWeather,
      moon,
      areaCondition,
    );

    hourly.push({
      ...intervalWeather,
      intervalEnd: nextHour.time,
      score,
      label: scoreLabel(score),
      moonEffect: moonEffect(moon, weather.cloudCover),
      moonIllumination: moon.illumination,
      moonPhase: moon.phase,
      moonAltitudeDeg: moon.altitudeDeg,
      recentRainMm24h: recentRain,
    });
  }

  return hourly;
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
  return `${bestHour.time.slice(11, 16)}-${bestHour.intervalEnd.slice(11, 16)}`;
}

export function toForecastCondition(bestHour: ForecastHourlyScore) {
  return {
    time: bestHour.time,
    intervalEnd: bestHour.intervalEnd,
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

export function jstDateFromOpenMeteoTime(time: string) {
  return new Date(`${time}+09:00`);
}
