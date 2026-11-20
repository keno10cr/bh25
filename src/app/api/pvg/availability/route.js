import { NextResponse } from "next/server";
import {
  AVAILABILITY_S_MAXAGE_SECONDS,
  AVAILABILITY_SWR_SECONDS,
} from "@/lib/cache";
import { loadEstateAvailability } from "@/lib/estateAvailability";

/**
 * Dynamic on purpose: estate calendar stays off the ISR page cache.
 * CDN Cache-Control absorbs repeat /pvg traffic without ISR Write Units.
 */
export const dynamic = "force-dynamic";

/** Public estate calendar for /pvg: dates only, never villa names or guests. */
export async function GET() {
  try {
    const { minDate, partialDates, fullDates } = await loadEstateAvailability();
    return NextResponse.json(
      { minDate, partialDates, fullDates },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${AVAILABILITY_S_MAXAGE_SECONDS}, stale-while-revalidate=${AVAILABILITY_SWR_SECONDS}`,
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
