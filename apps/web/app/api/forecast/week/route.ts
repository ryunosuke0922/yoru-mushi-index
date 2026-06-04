import { NextResponse } from "next/server";
import { buildWeeklyForecast } from "../../../lib/forecast";
import { forecastSearchParams } from "../../../lib/forecastRequest";

export async function GET(request: Request) {
  const { areaId, date } = forecastSearchParams(request);
  const forecasts = await buildWeeklyForecast(areaId, date);

  if (forecasts.length === 0) {
    return NextResponse.json({ error: "Area not found" }, { status: 404 });
  }

  return NextResponse.json({
    area: forecasts[0].area,
    date,
    forecasts,
  });
}
