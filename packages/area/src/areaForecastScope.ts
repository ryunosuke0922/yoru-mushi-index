import type { CoarseArea } from "./types";

// Broad region names only; never expose internal representative coordinates.
const islandScopes: Record<string, string> = {
  "tokyo-islands-20km-01":
    "伊豆大島周辺を代表する参考値です。八丈島・小笠原など、各島の予報を個別に計算したものではありません。",
  "kagoshima-islands-20km-01":
    "屋久島周辺を代表する参考値です。種子島・奄美・徳之島など、各島の予報を個別に計算したものではありません。",
  "okinawa-islands-20km-01":
    "宮古島周辺を代表する参考値です。石垣島・西表島など、各島の予報を個別に計算したものではありません。",
  "nagasaki-islands-20km-01":
    "平戸周辺を代表する参考値です。五島・対馬・壱岐など、各島の予報を個別に計算したものではありません。",
  "niigata-joetsu-sado-20km-01":
    "上越周辺を代表する参考値です。佐渡の予報を別に計算したものではありません。",
  "shimane-west-oki-20km-01":
    "浜田周辺を代表する参考値です。隠岐の各島の予報を個別に計算したものではありません。",
  "kagawa-east-20km-01":
    "高松周辺を代表する参考値です。小豆島の予報を別に計算したものではありません。",
};

export function areaForecastScope(area: Pick<CoarseArea, "id">) {
  return (
    islandScopes[area.id] ??
    "エリア内の一つの代表地域の条件を使った広域の参考値です。記載した地名ごとに予報を計算しているわけではありません。"
  );
}
