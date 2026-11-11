import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchOpenMeteoForecast } from "@yoru-mushi-index/weather";
import { buildForecast, buildWeeklyForecast } from "./forecast";
import { expectNoCoordinates } from "../api/testUtils";

vi.mock("@yoru-mushi-index/weather", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@yoru-mushi-index/weather")>();
  return { ...actual, fetchOpenMeteoForecast: vi.fn() };
});

// Full hourly provider responses exercise normalization and interval alignment.
function providerResponse(firstDay = "2026-06-04") {
  const start = Date.parse(firstDay + "T00:00:00Z");
  const time = Array.from({ length: 9 * 24 }, (_, index) =>
    new Date(start + index * 3_600_000).toISOString().slice(0, 16),
  );
  const values = (value: number): (number | null)[] => time.map(() => value);
  return {
    hourly: {
      time,
      temperature_2m: values(26),
      relative_humidity_2m: values(82),
      precipitation: values(0),
      wind_speed_10m: values(1),
      wind_gusts_10m: values(2),
      cloud_cover: values(90),
    },
  };
}

describe("forecast data integrity", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("実予報の5時間帯を使い、確率を捏造しない", async () => {
    vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(providerResponse());
    const result = await buildForecast("tokyo-tama-20km-01", "2026-06-05");

    expect(result).toMatchObject({
      status: "available",
      dataSource: "open-meteo",
      availableHours: 5,
      expectedHours: 5,
      modelVersion: "heuristic-v0.2",
      calibration: "uncalibrated",
      probabilityBand: null,
      dataNotice: null,
    });
    expect(result?.hourly).toHaveLength(5);
    expect(result?.hourly.at(-1)?.intervalEnd).toBe("2026-06-06T00:00");
    expect(fetchOpenMeteoForecast).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: "2026-06-04",
        endDate: "2026-06-06",
      }),
    );
    expectNoCoordinates(result);
  });

  it("昼の湿度と翌0時の気温が欠けても、必要な雨量と突風があれば全区間を採点する", async () => {
    const response = providerResponse();
    response.hourly.relative_humidity_2m[
      response.hourly.time.indexOf("2026-06-05T12:00")
    ] = null;
    response.hourly.temperature_2m[
      response.hourly.time.indexOf("2026-06-06T00:00")
    ] = null;
    vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(response);

    const result = await buildForecast("tokyo-tama-20km-01", "2026-06-05");
    expect(result).toMatchObject({ status: "available", availableHours: 5 });
  });

  it("20時の気温の欠測は20時開始の区間だけを除外する", async () => {
    const response = providerResponse();
    response.hourly.temperature_2m[
      response.hourly.time.indexOf("2026-06-05T20:00")
    ] = null;
    vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(response);

    const result = await buildForecast("tokyo-tama-20km-01", "2026-06-05");
    expect(result?.status).toBe("partial");
    expect(result?.hourly.map((hour) => hour.time.slice(11))).toEqual([
      "19:00",
      "21:00",
      "22:00",
      "23:00",
    ]);
  });

  it("翌0時の降水が欠測なら23時台をおすすめ候補から除外する", async () => {
    const response = providerResponse();
    const midnight = response.hourly.time.indexOf("2026-06-06T00:00");
    response.hourly.precipitation[midnight] = null;
    vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(response);
    const result = await buildForecast("tokyo-tama-20km-01", "2026-06-05");

    expect(result?.status).toBe("partial");
    expect(result?.availableHours).toBe(4);
    expect(result?.hourly.some((hour) => hour.time.endsWith("T23:00"))).toBe(
      false,
    );
    expect(result?.dataNotice).toContain("4 / 5");
  });

  it("直近24時間の雨量が不明な夜は好天とみなさない", async () => {
    const response = providerResponse();
    const noon = response.hourly.time.indexOf("2026-06-05T12:00");
    response.hourly.precipitation[noon] = null;
    vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(response);
    const result = await buildForecast("tokyo-tama-20km-01", "2026-06-05");

    expect(result).toMatchObject({
      status: "unavailable",
      score: null,
      label: null,
      bestTime: null,
      condition: null,
      taxa: null,
      hourly: [],
      reasons: [],
    });
  });

  it("同じ夜の各区間に対応する降水と突風で悪天候を抑える", async () => {
    const response = providerResponse();
    for (const time of [
      "2026-06-05T20:00",
      "2026-06-05T21:00",
      "2026-06-05T22:00",
      "2026-06-05T23:00",
      "2026-06-06T00:00",
    ]) {
      const index = response.hourly.time.indexOf(time);
      response.hourly.precipitation[index] = 20;
      response.hourly.wind_gusts_10m[index] = 30;
    }
    vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(response);
    const result = await buildForecast("tokyo-tama-20km-01", "2026-06-05");

    expect(result?.status).toBe("available");
    expect(result?.score).toBeLessThanOrEqual(29);
    expect(result?.hourly.every((hour) => hour.score <= 29)).toBe(true);
    for (const score of Object.values(result!.taxa!)) {
      expect(score).toBeLessThanOrEqual(29);
    }
  });

  it("週間取得も最後の翌0時まで要求し、最後の夜を欠落させない", async () => {
    vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(providerResponse());
    const results = await buildWeeklyForecast(
      "tokyo-tama-20km-01",
      "2026-06-05",
    );

    expect(results).toHaveLength(7);
    expect(results.every((forecast) => forecast.status === "available")).toBe(
      true,
    );
    expect(fetchOpenMeteoForecast).toHaveBeenCalledTimes(1);
    expect(fetchOpenMeteoForecast).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: "2026-06-04",
        endDate: "2026-06-12",
      }),
    );
    expectNoCoordinates(results);
  });
});

it("年越しの週間予報は、各日の月の平年値で算出する", async () => {
  vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(
    providerResponse("2026-12-30"),
  );
  const week = await buildWeeklyForecast("tokyo-tama-20km-01", "2026-12-31");
  const daily = await buildForecast("tokyo-tama-20km-01", "2026-12-31");
  expect(week[0].season.monthlyMeanTemperatureC).toBe(6);
  expect(week[1].season.monthlyMeanTemperatureC).toBe(4);
  expect(week[0].hourly).toEqual(daily?.hourly);
  expect(week.at(-1)?.hourly.at(-1)?.intervalEnd).toBe("2027-01-07T00:00");
});

it("同じ11月の気象でも道央と沖縄の指数・理由に地域差が出る", async () => {
  vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(
    providerResponse("2026-11-11"),
  );
  const north = await buildForecast("hokkaido-douou-20km-01", "2026-11-12");
  const south = await buildForecast("okinawa-main-20km-01", "2026-11-12");
  expect(north?.season).toMatchObject({ factor: 0.05, activity: "veryLow" });
  expect(south?.season).toMatchObject({ factor: 1, activity: "high" });
  expect(north?.score).toBeLessThan(south!.score!);
  expect(north?.hourly[0]?.score).toBeLessThan(south!.hourly[0]!.score);
  expect(north?.reasons.map((r) => r.text)).toContain(
    "季節的に飛翔はかなり鈍りやすい時期です",
  );
  expect(south?.reasons.map((r) => r.text)).toContain(
    "季節的に飛翔しやすい時期です",
  );
});
