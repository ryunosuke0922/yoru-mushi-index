import { publicArea, searchAreas } from "@yoru-mushi-index/area";
import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";

  return NextResponse.json({
    areas: searchAreas(query).map(publicArea),
  });
}
