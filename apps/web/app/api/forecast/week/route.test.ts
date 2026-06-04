import { describe, expect, it, vi } from "vitest";
import { expectNoCoordinates } from "../../testUtils";
import { GET } from "./route";

const weatherHours = vi.hoisted(() =>
  Array.from({ length: 8 }, (_, dayIndex) => {
    const date = `2026-06-${String(4 + dayIndex).padStart(2, "0")}`;

    return Array.from({ length: 24 }, (_, hour) => ({
      time: `${date}T${String(hour).padStart(2, "0")}:00`,
      temperature: hour >= 19 && hour <= 23 ? 24 : 20,
      humidity: hour >= 19 && hour <= 23 ? 76 : 60,
      precipitation: 0,
      windSpeed: 2,
      windGust: 4,
      cloudCover: 70,
    }));
  }).flat(),
);

vi.mock("@yoru-mushi-index/weather", () => ({
  fetchOpenMeteoForecast: vi.fn(async () => ({})),
  normalizeWeatherHours: vi.fn(() => weatherHours),
  recentRainMm24h: vi.fn(() => 0),
}));

describe("GET /api/forecast/week", () => {
  it("週間レスポンスに座標を含めない", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/forecast/week?areaId=tokyo-tama-20km-01&date=2026-06-05",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.area).toMatchObject({
      id: "tokyo-tama-20km-01",
      locationPolicy: "no_points",
      precision: "coarse_area",
    });
    expect(body.forecasts).toHaveLength(7);
    expectNoCoordinates(body);
  });

  it("未対応エリアは 404 を返す", async () => {
    const response = await GET(
      new Request("http://localhost/api/forecast/week?areaId=missing-area"),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Area not found" });
  });
});
