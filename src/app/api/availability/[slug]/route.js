import { NextResponse } from "next/server";
import {
  AVAILABILITY_S_MAXAGE_SECONDS,
  AVAILABILITY_SWR_SECONDS,
} from "@/lib/cache";
import { createSanityReadClient } from "@/lib/sanity/client";
import { toIsoDateList, tomorrowIsoDate } from "@/lib/availabilityDates";
import { ensureAirbnbCalendarsFresh } from "@/lib/ical/syncAirbnb";
import { loadPropertyCalendar } from "@/lib/inventory";
import {
  getDefaultPublishedNightly,
  sumHouseArrangementCapacity,
} from "@/lib/propertyPricing";

const PROPERTY_QUERY = `
*[_type == "property" && slug.current == $slug && listed != false && !(_id in path("drafts.**"))][0]{
  _id,
  name,
  priceMin,
  priceMax,
  minimumNights,
  baseGuestCount,
  extraGuestFeePerNight,
  cleaningFee,
  seasonalPricing[]{
    startDate,
    endDate,
    price,
    titleEn
  },
  houseArrangements[]{
    quantity,
    roomType->{ capacity }
  }
}
`;

/**
 * Dynamic on purpose: calendar payloads must not enter the ISR page cache.
 * CDN Cache-Control below absorbs repeat traffic without ISR Write Units.
 */
export const dynamic = "force-dynamic";

const AVAILABILITY_CACHE_CONTROL = `public, s-maxage=${AVAILABILITY_S_MAXAGE_SECONDS}, stale-while-revalidate=${AVAILABILITY_SWR_SECONDS}`;

export async function GET(_request, context) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: "Missing property slug." }, { status: 400 });
    }

    const client = createSanityReadClient();
    const property = await client.fetch(PROPERTY_QUERY, { slug });
    if (!property?._id) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    await ensureAirbnbCalendarsFresh({ propertyId: property._id });
    const calendar = await loadPropertyCalendar(client, property._id);

    const pricingMap = {};

    (property.seasonalPricing || []).forEach((season) => {
      if (!season?.startDate || !season?.endDate || typeof season.price !== "number") {
        return;
      }
      toIsoDateList(season.startDate, season.endDate).forEach((dateKey) => {
        pricingMap[dateKey] = season.price;
      });
    });

    const guestsMax = sumHouseArrangementCapacity(property.houseArrangements);

    return NextResponse.json(
      {
        disabledDates: Array.from(calendar.disabledNights).sort(),
        pricingMap,
        defaultNightlyRate: getDefaultPublishedNightly(property),
        minimumNights: property.minimumNights ?? null,
        baseGuestCount: property.baseGuestCount ?? null,
        extraGuestFeePerNight: property.extraGuestFeePerNight ?? null,
        cleaningFee: property.cleaningFee ?? null,
        guestsMax: guestsMax || null,
        minCheckInDate: tomorrowIsoDate(),
      },
      {
        headers: {
          "Cache-Control": AVAILABILITY_CACHE_CONTROL,
        },
      }
    );
  } catch (error) {
    console.error("[availability]", error);
    return NextResponse.json(
      { error: "Failed to load availability" },
      { status: 500 }
    );
  }
}
