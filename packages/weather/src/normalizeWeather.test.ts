import type { WeatherHour } from "@yoru-mushi-index/core";
import { describe, expect, it } from "vitest";
import { recentRainMm24h } from "./normalizeWeather";

const weatherHour = (time: string, precipitation: number): WeatherHour => ({
  time,
  temperature: 20,
  humidity: 70,
  precipitation,
  windSpeed: 2,
  windGust: 4,
  cloudCover: 60,
});

describe("recentRainMm24h", () => {
  it("基準時刻から直近 24 時間の雨量だけを合算する", () => {
    const hours = [
      weatherHour("2026-06-04T18:00", 9),
      weatherHour("2026-06-04T20:00", 2),
      weatherHour("2026-06-05T19:00", 1),
      weatherHour("2026-06-05T23:00", 8),
    ];

    expect(recentRainMm24h(hours, "2026-06-05T19:00")).toBe(3);
  });
});
