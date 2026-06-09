import { describe, expect, it } from "vitest";
import { formatNightDate, nightLabel } from "./format";

describe("format", () => {
  it("夜の日付を曜日付きで表示する", () => {
    expect(formatNightDate("2026-06-06")).toBe("6/6（土）夜");
  });

  it("今夜・明日夜以外の日別ラベルは曜日付きの日付にする", () => {
    expect(nightLabel("2026-06-08", "2026-06-06")).toBe("6/8（月）夜");
  });
});
