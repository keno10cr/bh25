import { NextResponse } from "next/server";
import { loadEstateAvailability } from "@/lib/estateAvailability";

export const dynamic = "force-dynamic";

/** Public estate calendar for /pvg: dates only, never villa names or guests. */
export async function GET() {
  try {
    const { minDate, partialDates, fullDates } = await loadEstateAvailability();
    return NextResponse.json(
      { minDate, partialDates, fullDates },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[pvg availability]", error);
    return NextResponse.json(
      { error: "Failed to load availability" },
      { status: 500 }
    );
  }
}
