import { describe, expect, it } from "vitest";
import { probabilityBand, scoreLabel } from "./labels";
import { calculateNightInsectScore } from "./score";

describe("calculateNightInsectScore", () => {
  it("暖かく無風で雨上がり、新月寄りなら高スコア", () => {
    const score = calculateNightInsectScore(
      {
        time: "2026-06-04T20:00:00+09:00",
        temperature: 25,
        humidity: 82,
        precipitation: 0,
        windSpeed: 1.2,
        windGust: 3,
        cloudCover: 70,
      },
      {
        illumination: 0.1,
        altitudeDeg: -5,
      },
      {
        seasonScore: 0.9,
        habitatScore: 0.8,
        recentRainMm24h: 8,
      },
    );

    expect(score).toBeGreaterThanOrEqual(75);
  });

  it("寒く強風で満月なら低スコア", () => {
    const score = calculateNightInsectScore(
      {
        time: "2026-06-04T20:00:00+09:00",
        temperature: 13,
        humidity: 55,
        precipitation: 0,
        windSpeed: 6,
        windGust: 10,
        cloudCover: 5,
      },
      {
        illumination: 0.95,
        altitudeDeg: 45,
      },
      {
        seasonScore: 0.6,
        habitatScore: 0.5,
        recentRainMm24h: 0,
      },
    );

    expect(score).toBeLessThanOrEqual(40);
  });
});

describe("score labels", () => {
  it("スコア帯からラベルと見込みを返す", () => {
    expect(scoreLabel(85)).toBe("とても高い");
    expect(probabilityBand(85)).toBe("70-90%");
    expect(scoreLabel(70)).toBe("高い");
    expect(probabilityBand(70)).toBe("55-75%");
    expect(scoreLabel(29)).toBe("とても低い");
    expect(probabilityBand(29)).toBe("0-20%");
  });
});
