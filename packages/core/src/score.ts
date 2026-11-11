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
  score *= area.season.factor;

  return finalizeScore(score, weather);
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
    moths: finalizeScore(totalScore + mothHabitatBoost, weather),
    beetles: finalizeScore(totalScore - 12 + beetleTemperatureBoost, weather),
    aquaticInsects: finalizeScore(
      totalScore - 4 + aquaticRainBoost + aquaticHabitatBoost,
      weather,
    ),
  };
}

function finalizeScore(score: number, weather: WeatherHour): number {
  const temperatureCapped = applyTemperatureCap(score, weather.temperature);
  return clamp(Math.round(applyWeatherCap(temperatureCapped, weather)), 0, 100);
}

function applyWeatherCap(score: number, weather: WeatherHour): number {
  // Provisional product guardrails, not empirically calibrated biological
  // thresholds. Reuse the existing rain/wind categories so favorable factors
  // cannot cancel adverse weather into an ordinary or high observation score.
  // The same guardrails apply to taxa scores after their individual bonuses.
  if (
    weather.precipitation >= 2 ||
    weather.windSpeed > 6 ||
    weather.windGust > 10
  ) {
    return Math.min(score, 29);
  }

  if (
    weather.precipitation >= 0.5 ||
    weather.windSpeed > 4 ||
    weather.windGust > 7
  ) {
    return Math.min(score, 49);
  }

  return score;
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
  if (temperature >= 26) {
    return 18;
  }

  if (temperature >= 24) {
    return 12;
  }

  if (temperature >= 22) {
    return 6;
  }

  if (temperature >= 20) {
    return 0;
  }

  if (temperature >= 18) {
    return -8;
  }

  if (temperature >= 16) {
    return -16;
  }

  if (temperature >= 12) {
    return -28;
  }

  return -40;
}

function applyTemperatureCap(score: number, temperature: number): number {
  if (temperature < 12) {
    return Math.min(score, 15);
  }

  if (temperature < 16) {
    return Math.min(score, 30);
  }

  if (temperature < 18) {
    return Math.min(score, 45);
  }

  if (temperature < 25) {
    return Math.min(score, interpolateTemperatureCap(temperature));
  }

  if (temperature < 26) {
    return Math.min(score, 95);
  }

  return score;
}

function interpolateTemperatureCap(temperature: number): number {
  const capPoints = [
    [18, 45],
    [20, 55],
    [21, 62],
    [22, 70],
    [23, 78],
    [24, 86],
    [25, 95],
  ] as const;

  const upperPoint = capPoints.find(([pointTemperature]) => {
    return temperature <= pointTemperature;
  });
  const upperIndex = upperPoint ? capPoints.indexOf(upperPoint) : -1;

  if (upperIndex <= 0) {
    return capPoints[0][1];
  }

  const [lowerTemperature, lowerCap] = capPoints[upperIndex - 1]!;
  const [upperTemperature, upperCap] = capPoints[upperIndex]!;
  const progress =
    (temperature - lowerTemperature) / (upperTemperature - lowerTemperature);

  return lowerCap + (upperCap - lowerCap) * progress;
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
