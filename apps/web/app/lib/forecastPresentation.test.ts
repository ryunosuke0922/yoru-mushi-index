import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { fetchOpenMeteoForecast } from "@yoru-mushi-index/weather";
import { buildForecast } from "./forecast";
import { forecastTimeSummary } from "./forecastPresentation";
import {
  ForecastDashboard,
  WeeklyForecastList,
} from "../components/ForecastDashboard";

vi.mock("@yoru-mushi-index/weather", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@yoru-mushi-index/weather")>()),
  fetchOpenMeteoForecast: vi.fn(),
}));

function coldWeather(missingHours: number[] = []) {
  const time = Array.from({ length: 72 }, (_, i) =>
    new Date(Date.UTC(2026, 10, 17, i)).toISOString().slice(0, 16),
  );
  return {
    hourly: {
      time,
      temperature_2m: time.map((_, i) =>
        missingHours.includes(i) ? null : -15,
      ),
      relative_humidity_2m: time.map(() => 30),
      precipitation: time.map(() => 0),
      wind_speed_10m: time.map(() => 20),
      wind_gusts_10m: time.map(() => 30),
      cloud_cover: time.map(() => 0),
    },
  };
}

describe("zero-score forecast presentation", () => {
  it.each([{ missing: [] }, { missing: [44] }])(
    "0点でも欠測と区別し、要約と週間表示で時間を勧めない (%j)",
    async ({ missing }) => {
      vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(coldWeather(missing));
      const forecast = (await buildForecast(
        "tokyo-tama-20km-01",
        "2026-11-18",
      ))!;
      expect(forecast.score).toBe(0);
      expect(forecast.bestTime).toBeNull();
      expect(forecast.condition).not.toBeNull();
      expect(forecast.hourly.length).toBe(missing.length ? 4 : 5);
      const summary = forecastTimeSummary(forecast);
      expect(summary).toContain(
        missing.length ? "取得できた時間帯には" : "この夜は",
      );
      const dashboard = renderToStaticMarkup(
        createElement(ForecastDashboard, { forecast, showAreaLink: false }),
      );
      const weekly = renderToStaticMarkup(
        createElement(WeeklyForecastList, { forecasts: [forecast] }),
      );
      for (const html of [dashboard, weekly]) {
        expect(html).toContain(summary);
        expect(html).not.toContain("おすすめ");
        expect(html).not.toContain("データなし");
      }
      expect(dashboard).toContain("時間帯ごとの指数");
      expect(dashboard).toContain("23:00");
    },
  );

  it("得点差がある日は相対的な最高時間として説明する", () => {
    expect(
      forecastTimeSummary({
        score: 12,
        bestTime: "21:00-22:00",
        status: "available",
      }),
    ).toBe("予報時間内で最も条件がよい時間は21:00-22:00（日本時間）です。");
    expect(
      forecastTimeSummary({
        score: 12,
        bestTime: "21:00-22:00",
        status: "partial",
      }),
    ).toContain("取得できた範囲");
  });

  it("取得不能の夜を0点と扱わない", async () => {
    vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(
      coldWeather([43, 44, 45, 46, 47]),
    );
    const forecast = (await buildForecast("tokyo-tama-20km-01", "2026-11-18"))!;
    expect(forecast.score).toBeNull();
    expect(forecastTimeSummary(forecast)).toContain("時間帯を比較できません");
    expect(
      renderToStaticMarkup(
        createElement(WeeklyForecastList, { forecasts: [forecast] }),
      ),
    ).toContain("データなし");
  });
});
