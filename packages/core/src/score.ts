import { clamp } from "@yoru-mushi-index/shared";
import type {
  AreaCondition,
  MoonCondition,
  TaxaScores,
  WeatherHour,
} from "./types";

export function calculateNightInsectScore(
  weather: WeatherHour,
  moon: MoonCondition,
  area: AreaCondition,
): number {
  let score = 35;

  score += temperatureScore(weather.temperature);
  score += windScore(weather.windSpeed, weather.windGust);
  score += rainScore(weather.precipitation, area.recentRainMm24h);
  score += humidityScore(weather.humidity);
  score += moonScore(moon, weather.cloudCover);
  score += area.seasonScore * 15;
  score += area.habitatScore * 10;

  return clamp(Math.round(score), 0, 100);
}

export function calculateTaxaScores(
  totalScore: number,
  weather: WeatherHour,
  area: AreaCondition,
): TaxaScores {
  const mothHabitatBoost = area.habitatScore * 8;
  const beetleTemperatureBoost = temperatureScore(weather.temperature) * 0.4;
  const aquaticRainBoost = Math.min(area.recentRainMm24h, 12) * 1.2;
  const aquaticHabitatBoost = area.habitatScore * 4;

  return {
    moths: clamp(Math.round(totalScore + mothHabitatBoost), 0, 100),
    beetles: clamp(
      Math.round(totalScore - 12 + beetleTemperatureBoost),
      0,
      100,
    ),
    aquaticInsects: clamp(
      Math.round(totalScore - 4 + aquaticRainBoost + aquaticHabitatBoost),
      0,
      100,
    ),
  };
}

export function moonEffect(
  moon: MoonCondition,
  cloudCover: number,
): "small" | "medium" | "large" {
  const visibleMoon = visibleMoonRatio(moon, cloudCover);

  if (visibleMoon >= 0.55) {
    return "large";
  }

  if (visibleMoon >= 0.25) {
    return "medium";
  }

  return "small";
}

function temperatureScore(temperature: number): number {
  if (temperature >= 24) {
    return 18;
  }

  if (temperature >= 20) {
    return 13;
  }

  if (temperature >= 16) {
    return 5;
  }

  if (temperature >= 12) {
    return -10;
  }

  return -20;
}

function humidityScore(humidity: number): number {
  if (humidity >= 80) {
    return 8;
  }

  if (humidity >= 65) {
    return 5;
  }

  if (humidity >= 50) {
    return 0;
  }

  return -6;
}

function windScore(windSpeed: number, windGust: number): number {
  if (windSpeed <= 2 && windGust <= 4) {
    return 12;
  }

  if (windSpeed <= 4 && windGust <= 7) {
    return 4;
  }

  if (windSpeed <= 6 && windGust <= 10) {
    return -10;
  }

  return -20;
}

function rainScore(precipitation: number, recentRainMm24h: number): number {
  if (precipitation >= 2) {
    return -18;
  }

  if (precipitation >= 0.5) {
    return -8;
  }

  if (recentRainMm24h >= 5) {
    return 9;
  }

  if (recentRainMm24h >= 1) {
    return 4;
  }

  return 0;
}

function moonScore(moon: MoonCondition, cloudCover: number): number {
  const visibleMoon = visibleMoonRatio(moon, cloudCover);

  if (visibleMoon >= 0.75) {
    return -14;
  }

  if (visibleMoon >= 0.45) {
    return -8;
  }

  if (visibleMoon >= 0.2) {
    return -3;
  }

  return 5;
}

function visibleMoonRatio(moon: MoonCondition, cloudCover: number): number {
  return moon.altitudeDeg > 0 ? moon.illumination * (1 - cloudCover / 100) : 0;
}
