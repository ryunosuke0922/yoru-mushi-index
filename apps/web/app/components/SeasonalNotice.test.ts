import { findAreaById, publicArea } from "@yoru-mushi-index/area";
import { seasonForMonth } from "@yoru-mushi-index/core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { SeasonalNotice } from "./SeasonalNotice";

it.each([
  ["hokkaido-douou-20km-01", "寒さで夜虫指数が低め"],
  ["okinawa-main-20km-01", "季節的には虫が飛びやすい"],
])("同じ11月でも予報エリアの季節を表示する (%s)", (areaId, message) => {
  const area = findAreaById(areaId)!;
  const date = "2026-11-12";
  const forecast = {
    area: publicArea(area),
    date,
    season: seasonForMonth(date, area.monthlyMeanTemperaturesC),
  };
  const html = renderToStaticMarkup(
    createElement(SeasonalNotice, { forecast }),
  );
  expect(html).toContain(area.name);
  expect(html).toContain(message);
  expect(html).toContain(`約${forecast.season.monthlyMeanTemperatureC}℃`);
});

it("未選択の画面では特定地域の気候を表示しない", () => {
  const html = renderToStaticMarkup(createElement(SeasonalNotice, {}));
  expect(html).toContain("地域によって異なります");
  expect(html).not.toContain("℃");
});
