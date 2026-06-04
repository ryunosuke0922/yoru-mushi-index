import { NextResponse } from "next/server";
import { buildForecast } from "../../lib/forecast";
import { forecastSearchParams } from "../../lib/forecastRequest";

export async function GET(request: Request) {
  const { areaId, date } = forecastSearchParams(request);
  const forecast = await buildForecast(areaId, date);

  if (!forecast) {
    return NextResponse.json({ error: "Area not found" }, { status: 404 });
  }

  return NextResponse.json(forecast);
}
