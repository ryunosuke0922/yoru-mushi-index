import { describe, expect, it } from "vitest";
import { probabilityBand, scoreLabel } from "./labels";
import { scoreReasons } from "./reasons";
import { calculateNightInsectScore, seasonalActivityScore } from "./score";

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

  it("20度台前半は他条件が良くても最上位帯に入りにくい", () => {
    const score = calculateNightInsectScore(
      {
        time: "2026-06-06T21:00:00+09:00",
        temperature: 20.6,
        humidity: 83,
        precipitation: 0,
        windSpeed: 0.7,
        windGust: 2.3,
        cloudCover: 27,
      },
      {
        illumination: 0.68,
        altitudeDeg: -26.5,
      },
      {
        seasonScore: 0.89,
        habitatScore: 0.79,
        recentRainMm24h: 0,
      },
    );

    expect(score).toBe(59);
  });

  it("冬季は気象条件が良くても月別補正で抑える", () => {
    const score = calculateNightInsectScore(
      {
        time: "2026-01-06T21:00:00+09:00",
        temperature: 24,
        humidity: 83,
        precipitation: 0,
        windSpeed: 0.7,
        windGust: 2.3,
        cloudCover: 80,
      },
      {
        illumination: 0.1,
        altitudeDeg: -10,
      },
      {
        seasonScore: 0.9,
        habitatScore: 0.8,
        recentRainMm24h: 0,
      },
    );

    expect(score).toBeLessThan(20);
  });
});

describe("seasonalActivityScore", () => {
  it("月ごとの活動しやすさを返す", () => {
    expect(seasonalActivityScore("2026-01-06T21:00:00+09:00")).toBe(0.05);
    expect(seasonalActivityScore("2026-06-06T21:00:00+09:00")).toBe(1);
    expect(seasonalActivityScore("2026-08-06T21:00:00+09:00")).toBe(0.95);
  });
});

describe("scoreReasons", () => {
  it("月が地平線下なら月明かりの影響なしとして返す", () => {
    expect(
      scoreReasons(
        {
          time: "2026-06-04T20:00:00+09:00",
          temperature: 22,
          humidity: 68,
          precipitation: 0,
          windSpeed: 2,
          windGust: 4,
          cloudCover: 10,
        },
        {
          illumination: 0.9,
          altitudeDeg: -20,
        },
        {
          seasonScore: 0.8,
          habitatScore: 0.8,
          recentRainMm24h: 0,
        },
      ),
    ).toContainEqual({
      text: "月明かりの影響はほぼありません",
      tone: "positive",
    });
  });

  it("中間条件の抑制要因も返す", () => {
    expect(
      scoreReasons(
        {
          time: "2026-06-04T20:00:00+09:00",
          temperature: 19,
          humidity: 58,
          precipitation: 0,
          windSpeed: 4.5,
          windGust: 8,
          cloudCover: 80,
        },
        {
          illumination: 0.4,
          altitudeDeg: 12,
        },
        {
          seasonScore: 0.8,
          habitatScore: 0.8,
          recentRainMm24h: 0,
        },
      ),
    ).toEqual(
      expect.arrayContaining([
        { text: "気温はやや低めです", tone: "negative" },
        { text: "季節的に飛翔しやすい時期です", tone: "positive" },
        { text: "風がやや強めです", tone: "negative" },
        { text: "直近の雨量は少なめです", tone: "negative" },
        { text: "湿度はやや低めです", tone: "negative" },
      ]),
    );
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
