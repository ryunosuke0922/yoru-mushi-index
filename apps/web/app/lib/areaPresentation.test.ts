import { expect, it } from "vitest";
import { findAreaById } from "@yoru-mushi-index/area";
import { areaForecastDescription, areaForecastTitle } from "./areaPresentation";

it.each([
  ["tokyo-islands-20km-01", "伊豆大島周辺", "八丈島・小笠原"],
  ["kagoshima-islands-20km-01", "屋久島周辺", "奄美・徳之島"],
  ["okinawa-islands-20km-01", "宮古島周辺", "石垣島・西表島"],
  ["nagasaki-islands-20km-01", "平戸周辺", "五島・対馬・壱岐"],
  ["niigata-joetsu-sado-20km-01", "上越周辺", "佐渡"],
  ["shimane-west-oki-20km-01", "浜田周辺", "隠岐"],
])("島の名前と予報の代表範囲を区別する (%s)", (id, representative, islands) => {
  const area = findAreaById(id)!;
  const description = areaForecastDescription(area);
  expect(description).toContain(representative);
  expect(description).toContain(islands);
  expect(description).toContain("計算したものではありません");
  expect(description).not.toContain(String(area.latitude));
  expect(description).not.toContain(String(area.longitude));
});

it("2地域のタイトルに対象範囲を明示する", () => {
  expect(areaForecastTitle(findAreaById("hokkaido-douou-20km-01")!)).toContain(
    "札幌・小樽周辺（道央）",
  );
  expect(
    areaForecastTitle(findAreaById("niigata-joetsu-sado-20km-01")!),
  ).toContain("上越の参考値");
});
