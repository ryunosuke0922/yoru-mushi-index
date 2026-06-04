import type { WeatherHour } from "@yoru-mushi-index/core";
import type { OpenMeteoForecastResponse } from "./types";

export function normalizeWeatherHours(
  response: OpenMeteoForecastResponse,
): WeatherHour[] {
  return response.hourly.time.map((time, index) => ({
    time,
    temperature: response.hourly.temperature_2m[index] ?? 0,
    humidity: response.hourly.relative_humidity_2m[index] ?? 0,
    precipitation: response.hourly.precipitation[index] ?? 0,
    windSpeed: response.hourly.wind_speed_10m[index] ?? 0,
    windGust: response.hourly.wind_gusts_10m[index] ?? 0,
    cloudCover: response.hourly.cloud_cover[index] ?? 0,
  }));
}

export function recentRainMm24h(
  hours: WeatherHour[],
  referenceTime: string,
): number {
  const referenceMs = new Date(referenceTime).getTime();
  const startMs = referenceMs - 24 * 60 * 60 * 1000;

  return hours
    .filter((hour) => {
      const hourMs = new Date(hour.time).getTime();
      return hourMs > startMs && hourMs < referenceMs;
    })
    .reduce((total, hour) => total + hour.precipitation, 0);
}
