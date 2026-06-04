import { findAreaById } from "@yoru-mushi-index/area";
import type { WeatherHour } from "@yoru-mushi-index/core";
import { describe, expect, it } from "vitest";
import {
  buildHourlyScores,
  fallbackWeatherHours,
  findBestHour,
  formatBestTime,
  jstDateFromOpenMeteoTime,
  toForecastCondition,
} from "./forecastScoring";

const weatherHour = (
  time: string,
  overrides: Partial<WeatherHour> = {},
): WeatherHour => ({
  time,
  temperature: 24,
  humidity: 76,
  precipitation: 0,
  windSpeed: 2,
  windGust: 4,
  cloudCover: 70,
  ...overrides,
});

describe("forecastScoring", () => {
  it("fallback weather は前日と対象日の 48 時間分を返す", () => {
    const hours = fallbackWeatherHours("2026-06-05");

    expect(hours).toHaveLength(48);
    expect(hours[0]?.time).toBe("2026-06-04T00:00");
    expect(hours.at(-1)?.time).toBe("2026-06-05T23:00");
  });

  it("対象日の 19-23 時だけをスコア化する", () => {
    const area = findAreaById("tokyo-tama-20km-01");
    if (!area) {
      throw new Error("Fixture area is missing.");
    }

    const weatherHours = [
      weatherHour("2026-06-04T20:00", { precipitation: 3 }),
      weatherHour("2026-06-05T18:00"),
      weatherHour("2026-06-05T19:00"),
      weatherHour("2026-06-05T20:00", { temperature: 26 }),
      weatherHour("2026-06-05T21:00"),
      weatherHour("2026-06-05T22:00"),
      weatherHour("2026-06-05T23:00"),
      weatherHour("2026-06-06T19:00"),
    ];

    const hourly = buildHourlyScores(
      weatherHours,
      area,
      {
        seasonScore: area.seasonScore,
        habitatScore: area.habitatScore,
      },
      "2026-06-05",
    );

    expect(hourly.map((hour) => hour.time)).toEqual([
      "2026-06-05T19:00",
      "2026-06-05T20:00",
      "2026-06-05T21:00",
      "2026-06-05T22:00",
      "2026-06-05T23:00",
    ]);
    expect(hourly[0]?.recentRainMm24h).toBe(3);
  });

  it("Open-Meteo の offset なし JST 文字列を JST として解釈する", () => {
    expect(jstDateFromOpenMeteoTime("2026-06-05T19:00").toISOString()).toBe(
      "2026-06-05T10:00:00.000Z",
    );
  });

  it("最高スコアの時間、表示時間、取得条件を返す", () => {
    const hours = [
      {
        ...weatherHour("2026-06-05T19:00"),
        score: 72,
        label: "高い" as const,
        moonEffect: "small" as const,
        moonIllumination: 0.2,
        moonPhase: 0.1,
        moonAltitudeDeg: -5,
        recentRainMm24h: 2,
      },
      {
        ...weatherHour("2026-06-05T20:00", { temperature: 25 }),
        score: 91,
        label: "とても高い" as const,
        moonEffect: "small" as const,
        moonIllumination: 0.1,
        moonPhase: 0.2,
        moonAltitudeDeg: -8,
        recentRainMm24h: 4,
      },
    ];

    const bestHour = findBestHour(hours);

    expect(bestHour?.time).toBe("2026-06-05T20:00");
    expect(bestHour ? formatBestTime(bestHour) : null).toBe("20:00-21:00");
    expect(bestHour ? toForecastCondition(bestHour) : null).toMatchObject({
      time: "2026-06-05T20:00",
      temperature: 25,
      recentRainMm24h: 4,
      moonPhase: 0.2,
    });
  });
});
