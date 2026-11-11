import type { WeatherHour } from "@yoru-mushi-index/core";

const hourMs = 60 * 60 * 1000;

export type WeatherSample = Pick<WeatherHour, "time"> & {
  [K in Exclude<keyof WeatherHour, "time">]: number | null;
};

export function normalizeWeatherHours(response: unknown): WeatherSample[] {
  if (!isRecord(response) || !isRecord(response.hourly)) {
    return [];
  }

  const hourly = response.hourly;
  if (!Array.isArray(hourly.time)) {
    return [];
  }

  return hourly.time.flatMap((time, index): WeatherSample[] => {
    if (typeof time !== "string" || weatherTimeMs(time) === null) {
      return [];
    }

    return [
      {
        time,
        temperature: hourlyValue(hourly, "temperature_2m", index),
        humidity: hourlyValue(hourly, "relative_humidity_2m", index, 0, 100),
        precipitation: hourlyValue(hourly, "precipitation", index, 0),
        windSpeed: hourlyValue(hourly, "wind_speed_10m", index, 0),
        windGust: hourlyValue(hourly, "wind_gusts_10m", index, 0),
        cloudCover: hourlyValue(hourly, "cloud_cover", index, 0, 100),
      },
    ];
  });
}

/**
 * Open-Meteo precipitation is the total for the preceding hour. The 24
 * endpoints in (reference - 24h, reference] cover the complete preceding day.
 * An incomplete or ambiguous window is unknown, rather than dry.
 */
export function recentRainMm24h(
  hours: readonly Pick<WeatherSample, "time" | "precipitation">[],
  referenceTime: string,
): number | null {
  const referenceMs = weatherTimeMs(referenceTime);
  if (referenceMs === null) {
    return null;
  }

  const startMs = referenceMs - 24 * hourMs;
  const rainfallByTime = new Map<number, number>();

  for (const hour of hours) {
    const timeMs = weatherTimeMs(hour.time);
    if (timeMs === null || timeMs <= startMs || timeMs > referenceMs) {
      continue;
    }

    if (
      rainfallByTime.has(timeMs) ||
      !isFiniteNumber(hour.precipitation) ||
      hour.precipitation < 0
    ) {
      return null;
    }

    rainfallByTime.set(timeMs, hour.precipitation);
  }

  let total = 0;
  for (let index = 0; index < 24; index += 1) {
    const precipitation = rainfallByTime.get(referenceMs - index * hourMs);
    if (precipitation === undefined) {
      return null;
    }
    total += precipitation;
  }

  return total;
}

function hourlyValue(
  hourly: Record<string, unknown>,
  variable: string,
  index: number,
  min = -Infinity,
  max = Infinity,
): number | null {
  const values = hourly[variable];
  const value: unknown = Array.isArray(values) ? values[index] : null;
  return isFiniteNumber(value) && value >= min && value <= max ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function weatherTimeMs(time: unknown): number | null {
  if (
    typeof time !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):00$/.test(time)
  ) {
    return null;
  }

  const timestamp = Date.parse(`${time}+09:00`);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  const roundTrip = new Date(timestamp + 9 * hourMs).toISOString().slice(0, 16);
  return roundTrip === time ? timestamp : null;
}
