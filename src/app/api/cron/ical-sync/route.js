import { NextResponse } from "next/server";
import { ensureAirbnbCalendarsFresh } from "@/lib/ical/syncAirbnb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await ensureAirbnbCalendarsFresh({ force: true });
  return NextResponse.json(result);
}
