import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { fetchOpenMeteoForecast } from "@yoru-mushi-index/weather";
import { buildForecast } from "./forecast";
import { forecastTiming } from "./forecastPresentation";
import { createForecastImage } from "../components/ForecastImageShareButton";
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

describe("forecast presentation", () => {
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
      const summary = forecastTiming(forecast).summary;
      expect(summary).toContain(
        missing.length ? "取得できた時間帯には" : "この夜は",
      );
      const dashboard = renderToStaticMarkup(
        createElement(ForecastDashboard, { forecast }),
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

  it.each([
    {
      scores: [8, 8, 8, 8, 8],
      value: "全時間帯で同点",
      expected: "全時間帯で同じ8点です。",
    },
    {
      scores: [8, 8],
      value: "取得できた2時間帯で同点",
      expected: "取得できた2時間帯で同じ8点です。",
    },
    {
      scores: [8],
      value: "19:00-20:00",
      expected: "取得できた時間帯は19:00-20:00（日本時間）のみです。",
    },
    {
      scores: [8, 2, 8, 3, 1],
      value: "19時台・21時台",
      expected:
        "予報時間内で最も条件がよい時間は19時台・21時台（日本時間）です。",
    },
    {
      scores: [8, 2, 3],
      value: "19:00-20:00",
      expected:
        "取得できた範囲で最も条件がよい時間は19:00-20:00（日本時間）です。",
    },
    {
      scores: [8, 2, 3, 4, 1],
      value: "19:00-20:00",
      expected: "予報時間内で最も条件がよい時間は19:00-20:00（日本時間）です。",
    },
  ])(
    "要約、詳細カード、週間カードに比較結果を表示する ($scores)",
    async ({ scores, value, expected }) => {
      const missing = [43, 44, 45, 46, 47].slice(scores.length);
      vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(coldWeather(missing));
      const base = (await buildForecast("tokyo-tama-20km-01", "2026-11-18"))!;
      const forecast = {
        ...base,
        score: 8,
        bestTime: "19:00-20:00",
        hourly: base.hourly.map((hour, i) => ({ ...hour, score: scores[i]! })),
      };
      expect(forecastTiming(forecast).summary).toBe(expected);
      expect(
        renderToStaticMarkup(createElement(ForecastDashboard, { forecast })),
      ).toContain(value);
      expect(
        renderToStaticMarkup(
          createElement(WeeklyForecastList, { forecasts: [forecast] }),
        ),
      ).toContain(value);
    },
  );

  it("取得不能の夜を0点と扱わない", async () => {
    vi.mocked(fetchOpenMeteoForecast).mockResolvedValue(
      coldWeather([43, 44, 45, 46, 47]),
    );
    const forecast = (await buildForecast("tokyo-tama-20km-01", "2026-11-18"))!;
    expect(forecast.score).toBeNull();
    expect(forecastTiming(forecast).summary).toContain(
      "時間帯を比較できません",
    );
    expect(
      renderToStaticMarkup(
        createElement(WeeklyForecastList, { forecasts: [forecast] }),
      ),
    ).toContain("データなし");
  });
});

it.each([
  {
    scores: [8],
    expected: "取得できた時間帯は19:00-20:00（日本時間）のみです。",
  },
  {
    scores: [8, 2],
    expected:
      "取得できた範囲で最も条件がよい時間は19:00-20:00（日本時間）です。",
  },
])(
  "保存用の画像にも比較できた範囲を描く ($scores)",
  async ({ scores, expected }) => {
    const timing = forecastTiming({
      score: 8,
      status: "partial",
      bestTime: "19:00-20:00",
      hourly: scores.map((score, i) => ({
        score,
        time: `2026-11-26T${19 + i}:00`,
      })),
    });
    const context = {
      fillText: vi.fn<(text: string, x: number, y: number) => void>(),
      measureText: (text: string) => ({ width: text.length * 22 }),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
    };
    vi.stubGlobal("document", {
      createElement: () => ({
        getContext: () => context,
        toBlob: (callback: (image: Blob) => void) => callback(new Blob()),
      }),
    });
    try {
      await createForecastImage({
        areaName: "東京都 多摩エリア",
        timeSummary: timing.summary,
        date: "2026-11-26",
        label: "とても低い",
        partial: true,
        reasons: [],
        score: 8,
      });
      const lines = context.fillText.mock.calls.map(([text]) => text);
      expect(lines.join("")).toContain(expected);
      expect(lines.some((line) => line.includes("19:00-20:00"))).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  },
);
