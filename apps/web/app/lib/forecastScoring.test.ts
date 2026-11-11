import { findAreaById } from "@yoru-mushi-index/area";
import { seasonForMonth } from "@yoru-mushi-index/core";
import type { WeatherHour } from "@yoru-mushi-index/core";
import { describe, expect, it } from "vitest";
import {
  buildHourlyScores,
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

function completeWeatherHours(): WeatherHour[] {
  const start = Date.parse("2026-06-04T00:00:00Z");
  return Array.from({ length: 49 }, (_, index) =>
    weatherHour(new Date(start + index * 3_600_000).toISOString().slice(0, 16)),
  );
}

function scoreHours(weatherHours: WeatherHour[]) {
  const area = findAreaById("tokyo-tama-20km-01");
  if (!area) {
    throw new Error("Fixture area is missing.");
  }

  return buildHourlyScores(
    weatherHours,
    area,
    {
      season: seasonForMonth("2026-06-05", area.monthlyMeanTemperaturesC),
      seasonScore: area.seasonScore,
      habitatScore: area.habitatScore,
    },
    "2026-06-05",
  );
}

describe("forecastScoring", () => {
  it("対象日の 19-23 時だけをスコア化する", () => {
    const weatherHours = completeWeatherHours();
    weatherHours.find(
      (hour) => hour.time === "2026-06-04T20:00",
    )!.precipitation = 3;

    const hourly = scoreHours(weatherHours);

    expect(hourly.map((hour) => hour.time)).toEqual([
      "2026-06-05T19:00",
      "2026-06-05T20:00",
      "2026-06-05T21:00",
      "2026-06-05T22:00",
      "2026-06-05T23:00",
    ]);
    expect(hourly[0]?.recentRainMm24h).toBe(3);
  });

  it("現在の気温・月条件と次時刻の前1時間雨量・突風を組み合わせる", () => {
    const weatherHours = completeWeatherHours();
    Object.assign(
      weatherHours.find((hour) => hour.time === "2026-06-05T19:00")!,
      { precipitation: 1, windGust: 2, temperature: 24 },
    );
    Object.assign(
      weatherHours.find((hour) => hour.time === "2026-06-05T20:00")!,
      { precipitation: 4, windGust: 9, temperature: 17 },
    );

    expect(scoreHours(weatherHours)[0]).toMatchObject({
      time: "2026-06-05T19:00",
      intervalEnd: "2026-06-05T20:00",
      temperature: 24,
      precipitation: 4,
      windGust: 9,
      recentRainMm24h: 1,
    });
  });

  it("23-00時の雨量・突風は翌0時のレコードから取得する", () => {
    const weatherHours = completeWeatherHours();
    Object.assign(weatherHours.at(-1)!, {
      precipitation: 2.5,
      windGust: 11,
      temperature: 13,
    });

    const lastHour = scoreHours(weatherHours).at(-1)!;
    expect(lastHour).toMatchObject({
      time: "2026-06-05T23:00",
      intervalEnd: "2026-06-06T00:00",
      temperature: 24,
      precipitation: 2.5,
      windGust: 11,
    });
    expect(formatBestTime(lastHour)).toBe("23:00-00:00");
  });

  it("翌0時が欠測なら23時の天気を代用しない", () => {
    const weatherHours = completeWeatherHours().slice(0, -1);

    expect(
      scoreHours(weatherHours).map((hour) => hour.time.slice(11, 16)),
    ).toEqual(["19:00", "20:00", "21:00", "22:00"]);
  });

  it("24時間雨量が不完全な時間帯を採点しない", () => {
    const weatherHours = completeWeatherHours().filter(
      (hour) => hour.time !== "2026-06-04T20:00",
    );

    expect(
      scoreHours(weatherHours).map((hour) => hour.time.slice(11, 16)),
    ).toEqual(["20:00", "21:00", "22:00", "23:00"]);
  });

  it("観察区間の終端や過去雨量が重複していれば採点しない", () => {
    const weatherHours = completeWeatherHours();
    weatherHours.push({
      ...weatherHours.find((hour) => hour.time === "2026-06-05T20:00")!,
    });

    expect(scoreHours(weatherHours)).toEqual([]);
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
        intervalEnd: "2026-06-05T20:00",
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
        intervalEnd: "2026-06-05T21:00",
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
      intervalEnd: "2026-06-05T21:00",
      temperature: 25,
      recentRainMm24h: 4,
      moonPhase: 0.2,
    });
  });
});
