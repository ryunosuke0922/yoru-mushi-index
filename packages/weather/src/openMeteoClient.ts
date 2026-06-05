import type { OpenMeteoForecastResponse } from "./types";

const hourlyVariables = [
  "temperature_2m",
  "relative_humidity_2m",
  "precipitation",
  "wind_speed_10m",
  "wind_gusts_10m",
  "cloud_cover",
].join(",");

export async function fetchOpenMeteoForecast(input: {
  latitude: number;
  longitude: number;
  date: string;
  startDate?: string;
  endDate?: string;
  fetchOptions?: RequestInit;
}): Promise<OpenMeteoForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    hourly: hourlyVariables,
    wind_speed_unit: "ms",
    timezone: "Asia/Tokyo",
    start_date: input.startDate ?? input.date,
    end_date: input.endDate ?? input.date,
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    input.fetchOptions,
  );

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed: ${response.status}`);
  }

  return response.json() as Promise<OpenMeteoForecastResponse>;
}
