import { describe, expect, it } from "vitest";
import { areaFixtures } from "./areaFixtures";
import {
  findAreaById,
  groupAreasByRegionAndPrefecture,
  searchAreas,
} from "./areaResolver";

describe("area fixtures", () => {
  it("全国の地方別サブエリアを持つ", () => {
    expect(areaFixtures).toHaveLength(112);
  });

  it("エリアIDが重複していない", () => {
    const ids = areaFixtures.map((area) => area.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("デフォルトの東京都多摩エリアを解決できる", () => {
    expect(findAreaById("tokyo-tama-20km-01")?.name).toBe("東京都 多摩エリア");
  });

  it("別名からエリアを検索できる", () => {
    expect(searchAreas("奥多摩").map((area) => area.id)).toContain(
      "tokyo-tama-20km-01",
    );
    expect(searchAreas("浜松").map((area) => area.id)).toContain(
      "shizuoka-west-20km-01",
    );
    expect(searchAreas("伊豆").map((area) => area.id)).toContain(
      "shizuoka-izu-20km-01",
    );
    expect(searchAreas("やんばる").map((area) => area.id)).toContain(
      "okinawa-north-20km-01",
    );
  });

  it("地方名でも検索できる", () => {
    expect(searchAreas("中部").length).toBeGreaterThan(0);
  });

  it("地方と都道府県でグルーピングできる", () => {
    const groups = groupAreasByRegionAndPrefecture();

    expect(groups["中部"]?.["静岡県"].map((area) => area.id)).toEqual([
      "shizuoka-izu-20km-01",
      "shizuoka-east-20km-01",
      "shizuoka-central-20km-01",
      "shizuoka-west-20km-01",
    ]);
  });
});
