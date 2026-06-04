import { DEFAULT_AREA_ID } from "./constants";
import { todayKey } from "./format";

export function forecastSearchParams(request: Request) {
  const url = new URL(request.url);

  return {
    areaId: url.searchParams.get("areaId") ?? DEFAULT_AREA_ID,
    date: url.searchParams.get("date") ?? todayKey(),
  };
}
