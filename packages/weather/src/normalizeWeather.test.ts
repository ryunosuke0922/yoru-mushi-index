import type { WeatherHour } from "@yoru-mushi-index/core";
import { describe, expect, it } from "vitest";
import { normalizeWeatherHours, recentRainMm24h } from "./normalizeWeather";
import type { OpenMeteoForecastResponse } from "./types";

const weatherHour = (time: string, precipitation: number): WeatherHour => ({
  time,
  temperature: 20,
  humidity: 70,
  precipitation,
  windSpeed: 2,
  windGust: 4,
  cloudCover: 60,
});

const numericVariables = [
  ["temperature_2m", "temperature"],
  ["relative_humidity_2m", "humidity"],
  ["precipitation", "precipitation"],
  ["wind_speed_10m", "windSpeed"],
  ["wind_gusts_10m", "windGust"],
  ["cloud_cover", "cloudCover"],
] as const;

function responseFixture(): OpenMeteoForecastResponse {
  return {
    hourly: {
      time: ["2026-06-05T19:00", "2026-06-05T20:00"],
      temperature_2m: [24, 23],
      relative_humidity_2m: [70, 75],
      precipitation: [0, 1],
      wind_speed_10m: [2, 3],
      wind_gusts_10m: [4, 5],
      cloud_cover: [60, 70],
    },
  };
}

function completeRainWindow(): WeatherHour[] {
  const start = Date.parse("2026-06-04T19:00:00Z");
  return Array.from({ length: 26 }, (_, index) =>
    weatherHour(
      new Date(start + index * 3_600_000).toISOString().slice(0, 16),
      1,
    ),
  );
}

describe("normalizeWeatherHours", () => {
  it("実際のゼロ値を保持する", () => {
    const response = responseFixture();
    for (const [variable] of numericVariables) {
      response.hourly[variable][0] = 0;
    }

    expect(normalizeWeatherHours(response)[0]).toEqual({
      time: "2026-06-05T19:00",
      temperature: 0,
      humidity: 0,
      precipitation: 0,
      windSpeed: 0,
      windGust: 0,
      cloudCover: 0,
    });
  });

  it.each(numericVariables)(
    "%s の null・非有限値をゼロにしない",
    (variable, field) => {
      for (const invalid of [null, Number.NaN, Infinity, -Infinity]) {
        const response = responseFixture();
        response.hourly[variable][0] = invalid;

        const hours = normalizeWeatherHours(response);

        expect(hours[0]?.[field]).toBeNull();
        expect(hours[1]?.[field]).toBe(response.hourly[variable][1]);
      }
    },
  );

  it.each(numericVariables)(
    "%s の配列不足・欠落を補完しない",
    (variable, field) => {
      const response = responseFixture();
      response.hourly[variable].pop();

      expect(
        normalizeWeatherHours(response).map((hour) => hour[field]),
      ).toEqual([response.hourly[variable][0], null]);
      expect(
        normalizeWeatherHours({
          hourly: { ...response.hourly, [variable]: undefined },
        }).map((hour) => hour[field]),
      ).toEqual([null, null]);
    },
  );

  it.each([
    ["relative_humidity_2m", -1],
    ["relative_humidity_2m", 101],
    ["cloud_cover", -1],
    ["cloud_cover", 101],
    ["precipitation", -1],
    ["wind_speed_10m", -1],
    ["wind_gusts_10m", -1],
  ] as const)("範囲外の %s=%s を採点に渡さない", (variable, value) => {
    const response = responseFixture();
    response.hourly[variable][0] = value;

    const field = numericVariables.find(([name]) => name === variable)![1];
    expect(normalizeWeatherHours(response)[0]?.[field]).toBeNull();
  });

  it.each([null, {}, { hourly: null }, { hourly: { time: null } }])(
    "不完全なレスポンスから天気を作らない: %j",
    (response) => {
      expect(normalizeWeatherHours(response)).toEqual([]);
    },
  );

  it.each(["2026-02-30T19:00", "2026-06-05T19:30", "invalid"])(
    "不正または毎時でない日時を除外する: %s",
    (time) => {
      const response = responseFixture();
      response.hourly.time[0] = time;
      expect(normalizeWeatherHours(response).map((hour) => hour.time)).toEqual([
        "2026-06-05T20:00",
      ]);
    },
  );
});

describe("recentRainMm24h", () => {
  it("(基準時刻−24h, 基準時刻] の24個の前1時間積算値を合計する", () => {
    const hours = completeRainWindow();
    hours[0]!.precipitation = 100;
    hours[24]!.precipitation = 3;
    hours[25]!.precipitation = 100;

    expect(recentRainMm24h(hours, "2026-06-05T19:00")).toBe(26);
  });

  it("24時間分すべてがゼロのときだけゼロ雨量を返す", () => {
    const hours = completeRainWindow().map((hour) => ({
      ...hour,
      precipitation: 0,
    }));

    expect(recentRainMm24h(hours, "2026-06-05T19:00")).toBe(0);
    expect(recentRainMm24h([], "2026-06-05T19:00")).toBeNull();
  });

  it("途中の欠測を雨なしとみなさない", () => {
    const hours = completeRainWindow().filter(
      (hour) => hour.time !== "2026-06-05T03:00",
    );
    expect(recentRainMm24h(hours, "2026-06-05T19:00")).toBeNull();
  });

  it("重複した時刻を二重集計しない", () => {
    const hours = completeRainWindow();
    hours.push({ ...hours[12]! });
    expect(recentRainMm24h(hours, "2026-06-05T19:00")).toBeNull();
  });

  it("23時から翌0時にまたがる24時間も集計する", () => {
    const hours = Array.from({ length: 24 }, (_, hour) =>
      weatherHour(
        hour === 23
          ? "2026-06-06T00:00"
          : `2026-06-05T${String(hour + 1).padStart(2, "0")}:00`,
        1,
      ),
    );
    expect(recentRainMm24h(hours, "2026-06-06T00:00")).toBe(24);
  });

  it("非有限の積算値や不正な基準時刻は不明扱いにする", () => {
    const hours = completeRainWindow();
    hours[12]!.precipitation = Number.NaN;

    expect(recentRainMm24h(hours, "2026-06-05T19:00")).toBeNull();
    expect(recentRainMm24h(completeRainWindow(), "invalid")).toBeNull();
  });
});
