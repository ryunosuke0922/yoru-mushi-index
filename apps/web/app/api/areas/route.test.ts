import { describe, expect, it } from "vitest";
import { GET } from "./route";
import { expectNoCoordinates } from "../testUtils";

describe("GET /api/areas", () => {
  it("検索結果に座標を含めない", async () => {
    const response = GET(new Request("http://localhost/api/areas?q=奥多摩"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.areas.length).toBeGreaterThan(0);
    expect(body.areas[0]).toMatchObject({
      id: "tokyo-tama-20km-01",
      locationPolicy: "no_points",
      precision: "coarse_area",
    });
    expectNoCoordinates(body);
  });
});
