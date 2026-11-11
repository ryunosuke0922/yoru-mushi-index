import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchOpenMeteoForecast } from "@yoru-mushi-index/weather";
import { expectNoCoordinates } from "../testUtils";
import { GET } from "./route";

const weatherHours = vi.hoisted(() =>
  ["2026-06-04", "2026-06-05", "2026-06-06"].flatMap((date) =>
    Array.from({ length: 24 }, (_, hour) => ({
      time: `${date}T${String(hour).padStart(2, "0")}:00`,
      temperature: hour >= 19 && hour <= 23 ? 24 : 20,
      humidity: hour >= 19 && hour <= 23 ? 76 : 60,
      precipitation: 0,
      windSpeed: 2,
      windGust: 4,
      cloudCover: 70,
    })),
  ),
);

vi.mock("@yoru-mushi-index/weather", () => ({
  fetchOpenMeteoForecast: vi.fn(async () => ({})),
  normalizeWeatherHours: vi.fn(() => weatherHours),
  recentRainMm24h: vi.fn(() => 0),
}));

describe("GET /api/forecast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("公開レスポンスに座標を含めない", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/forecast?areaId=tokyo-tama-20km-01&date=2026-06-05",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.area).toMatchObject({
      id: "tokyo-tama-20km-01",
      locationPolicy: "no_points",
      precision: "coarse_area",
    });
    expect(body.hourly).toHaveLength(5);
    expect(body.status).toBe("available");
    expect(body.probabilityBand).toBeNull();
    expect(body.calibration).toBe("uncalibrated");
    expectNoCoordinates(body);
  });

  it("気象取得失敗は架空の指数を返さず 503 と欠測情報を返す", async () => {
    vi.mocked(fetchOpenMeteoForecast).mockRejectedValueOnce(
      new Error("offline"),
    );
    const response = await GET(
      new Request(
        "http://localhost/api/forecast?areaId=tokyo-tama-20km-01&date=2026-06-05",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      status: "unavailable",
      dataSource: "unavailable",
      score: null,
      label: null,
      condition: null,
      taxa: null,
      bestTime: null,
      probabilityBand: null,
      hourly: [],
    });
    expectNoCoordinates(body);
  });

  it("未対応エリアは 404 を返す", async () => {
    const response = await GET(
      new Request("http://localhost/api/forecast?areaId=missing-area"),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Area not found" });
  });
});
