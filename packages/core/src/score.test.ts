import { describe, expect, it } from "vitest";
import { scoreLabel } from "./labels";
import { scoreReasons } from "./reasons";
import {
  calculateNightInsectScore,
  calculateTaxaScores,
  moonEffect,
} from "./score";
import type { AreaCondition, MoonCondition, WeatherHour } from "./types";

import { seasonForMonth } from "./season";

const mildAreaNormals = [5, 6, 9, 14, 19, 22, 26, 27, 23, 18, 12, 8];
const summer = seasonForMonth("2026-06-04", mildAreaNormals);

const favorableWeather: WeatherHour = {
  time: "2026-06-04T20:00:00+09:00",
  temperature: 26,
  humidity: 82,
  precipitation: 0,
  windSpeed: 1.2,
  windGust: 3,
  cloudCover: 70,
};
const darkMoon: MoonCondition = { illumination: 0.1, altitudeDeg: -5 };
const favorableArea: AreaCondition = {
  season: summer,
  seasonScore: 0.9,
  habitatScore: 0.8,
  recentRainMm24h: 8,
};

function scoreFor(weather: Partial<WeatherHour> = {}): number {
  return calculateNightInsectScore(
    { ...favorableWeather, ...weather },
    darkMoon,
    favorableArea,
  );
}

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
        season: summer,
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
        season: summer,
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
        season: summer,
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
        season: seasonForMonth("2026-01-06", mildAreaNormals),
        seasonScore: 0.9,
        habitatScore: 0.8,
        recentRainMm24h: 0,
      },
    );

    expect(score).toBeLessThan(20);
  });

  it.each([
    ["降雨の既存区分の直前", { precipitation: 0.49 }, 100],
    ["降雨の既存区分の境界", { precipitation: 0.5 }, 49],
    ["強い降雨の既存区分の直前", { precipitation: 1.99 }, 49],
    ["強い降雨の既存区分の境界", { precipitation: 2 }, 29],
    ["強い雨の夜", { precipitation: 20 }, 29],
    ["風の既存区分の境界", { windSpeed: 4, windGust: 7 }, 100],
    ["風の既存区分を超えた夜", { windSpeed: 4.01 }, 49],
    ["強風の既存区分の境界", { windSpeed: 6, windGust: 10 }, 49],
    ["強風の既存区分を超えた夜", { windSpeed: 6.01 }, 29],
    ["突風の既存区分を超えた夜", { windGust: 7.01 }, 49],
    ["強い突風の既存区分を超えた夜", { windGust: 10.01 }, 29],
    ["強風と突風の夜", { windSpeed: 20, windGust: 30 }, 29],
  ] as const)(
    "%sは暖かさ・湿度・月・環境の加点で上限を超えない",
    (_, weather, cap) => {
      expect(scoreFor(weather)).toBe(cap);
    },
  );

  it("降雨・風・突風が強くなるほど好条件とは判定しない", () => {
    const sequences = [
      [0, 0.49, 0.5, 1.99, 2, 20].map((precipitation) =>
        scoreFor({ precipitation }),
      ),
      [1.2, 2, 2.01, 4, 4.01, 6, 6.01, 20].map((windSpeed) =>
        scoreFor({ windSpeed, windGust: Math.max(3, windSpeed) }),
      ),
      [3, 4, 4.01, 7, 7.01, 10, 10.01, 30].map((windGust) =>
        scoreFor({ windGust }),
      ),
    ];

    for (const sequence of sequences) {
      for (let index = 1; index < sequence.length; index += 1) {
        expect(sequence[index]).toBeLessThanOrEqual(sequence[index - 1]!);
      }
    }
  });
});

describe("calculateTaxaScores", () => {
  it.each([
    ["降雨", { precipitation: 0.8 }, 49],
    ["強い雨", { precipitation: 20 }, 29],
    ["風", { windSpeed: 5 }, 49],
    ["強風", { windSpeed: 20, windGust: 30 }, 29],
    ["低温", { temperature: 13 }, 30],
    ["低温と強い雨", { temperature: 10, precipitation: 20 }, 15],
  ] as const)(
    "%sによる上限を分類群別の加点でも超えない",
    (_, overrides, cap) => {
      const weather = { ...favorableWeather, ...overrides };
      const total = scoreFor(overrides);
      const scores = calculateTaxaScores(total, weather, favorableArea);

      for (const score of Object.values(scores)) {
        expect(score).toBeLessThanOrEqual(cap);
        expect(score).toBeGreaterThanOrEqual(0);
      }
    },
  );
});

describe("seasonForMonth", () => {
  it("平年気温に応じた補正を0.05〜1に収める", () => {
    const normals = [-4, 5, 10, 16, 21, 22, 29, 28, 24, 18, 11, 4];
    expect(seasonForMonth("2026-01-15", normals)).toEqual({
      monthlyMeanTemperatureC: -4,
      factor: 0.05,
      activity: "veryLow",
    });
    expect(seasonForMonth("2026-04-15", normals)).toEqual({
      monthlyMeanTemperatureC: 16,
      factor: 0.66,
      activity: "moderate",
    });
    expect(seasonForMonth("2026-07-15", normals)).toEqual({
      monthlyMeanTemperatureC: 29,
      factor: 1,
      activity: "high",
    });
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
          season: summer,
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
          season: summer,
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
        { text: "直近の雨量は少なめです", tone: "neutral" },
        { text: "湿度は中程度です", tone: "neutral" },
      ]),
    );
  });

  it.each([0.5, 0.8, 2, 20])(
    "時間降水量%s mmでは直近の雨の加点説明が現在の雨を上書きしない",
    (precipitation) => {
      const reasons = scoreReasons(
        { ...favorableWeather, precipitation },
        darkMoon,
        favorableArea,
      );

      expect(reasons).toContainEqual({
        text: "観察時間帯に雨が予想されています",
        tone: "negative",
      });
      expect(reasons).not.toContainEqual({
        text: "直近の雨による湿り気を見込んでいます",
        tone: "positive",
      });
    },
  );

  it("気温と湿度の無加減点帯に負の理由を付けない", () => {
    const reasons = scoreReasons(
      { ...favorableWeather, temperature: 20.6, humidity: 58 },
      darkMoon,
      { ...favorableArea, recentRainMm24h: 0 },
    );

    expect(reasons.filter((item) => item.tone === "negative")).toEqual([]);
  });

  it.each([
    [0.22, "small", "月明かりの影響が小さめです", "neutral"],
    [0.4, "medium", "月明かりの影響があります", "negative"],
    [0.8, "large", "月明かりの影響が大きめです", "negative"],
  ] as const)(
    "月の影響%sは共通の判定%sに沿って説明する",
    (illumination, effect, text, tone) => {
      const moon = { illumination, altitudeDeg: 5 };
      const weather = { ...favorableWeather, cloudCover: 0 };

      expect(moonEffect(moon, weather.cloudCover)).toBe(effect);
      expect(scoreReasons(weather, moon, favorableArea)).toContainEqual({
        text,
        tone,
      });
    },
  );
});

describe("score labels", () => {
  it("スコア帯から参考指数のラベルを返す", () => {
    expect(scoreLabel(85)).toBe("とても高い");
    expect(scoreLabel(70)).toBe("高い");
    expect(scoreLabel(50)).toBe("普通");
    expect(scoreLabel(49)).toBe("低い");
    expect(scoreLabel(30)).toBe("低い");
    expect(scoreLabel(29)).toBe("とても低い");
  });
});
