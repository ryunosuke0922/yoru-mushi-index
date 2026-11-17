import { areaForecastScope, type CoarseArea } from "@yoru-mushi-index/area";

export function areaForecastTitle(area: CoarseArea) {
  if (area.id === "hokkaido-douou-20km-01") {
    return `${area.aliases.slice(0, 2).join("・")}周辺（道央）の今夜の昆虫観察予報`;
  }
  if (area.id === "niigata-joetsu-sado-20km-01") {
    return "上越・佐渡エリアの今夜の昆虫観察予報（上越の参考値）";
  }
  return `${area.name}の昆虫観察予報`;
}

export function areaForecastDescription(area: CoarseArea) {
  return `${area.name}の夜虫指数。${areaForecastScope(area)}19時〜翌0時の時間帯ごとの指数と、今夜から7日分の予報を確認できます。`;
}
