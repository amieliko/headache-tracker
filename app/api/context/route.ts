import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "lat and lon are required" },
      { status: 400 }
    );
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set(
    "current",
    "surface_pressure,temperature_2m,relative_humidity_2m,weather_code"
  );
  url.searchParams.set("hourly", "surface_pressure");
  url.searchParams.set("past_hours", "24");
  url.searchParams.set("forecast_hours", "1");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString());
  if (!res.ok) {
    return NextResponse.json(
      { error: "Weather fetch failed" },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
