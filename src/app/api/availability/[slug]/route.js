import { NextResponse } from "next/server";
import { createSanityReadClient } from "@/lib/sanity/client";
import {
  occupiedNightsFromStay,
  toIsoDateList,
  tomorrowIsoDate,
} from "@/lib/availabilityDates";
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

const BLOCKED_DATES_QUERY = `
*[_type == "blockedDate" && property._ref == $propertyId && !(_id in path("drafts.**"))]{
  startDate,
  endDate
}
`;

/** Paid bookings occupy nights; pending does not block until webhook confirms. */
const PAID_BOOKINGS_QUERY = `
*[_type == "stayBooking"
  && property._ref == $propertyId
  && paymentStatus == "paid"
  && !(_id in path("drafts.**"))]{
  checkIn,
  checkOut
}
`;

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

    const [blockedDocs, paidBookings] = await Promise.all([
      client.fetch(BLOCKED_DATES_QUERY, { propertyId: property._id }),
      client.fetch(PAID_BOOKINGS_QUERY, { propertyId: property._id }),
    ]);

    const disabledDateSet = new Set();
    const pricingMap = {};

    (property.seasonalPricing || []).forEach((season) => {
      if (!season?.startDate || !season?.endDate || typeof season.price !== "number") {
        return;
      }
      toIsoDateList(season.startDate, season.endDate).forEach((dateKey) => {
        pricingMap[dateKey] = season.price;
      });
    });

    (blockedDocs || []).forEach((blocked) => {
      if (!blocked?.startDate || !blocked?.endDate) return;
      toIsoDateList(blocked.startDate, blocked.endDate).forEach((dateKey) => {
        disabledDateSet.add(dateKey);
      });
    });

    (paidBookings || []).forEach((booking) => {
      occupiedNightsFromStay(booking.checkIn, booking.checkOut).forEach((dateKey) => {
        disabledDateSet.add(dateKey);
      });
    });

    const guestsMax = sumHouseArrangementCapacity(property.houseArrangements);

    return NextResponse.json({
      disabledDates: Array.from(disabledDateSet).sort(),
      pricingMap,
      defaultNightlyRate: getDefaultPublishedNightly(property),
      minimumNights: property.minimumNights ?? null,
      baseGuestCount: property.baseGuestCount ?? null,
      extraGuestFeePerNight: property.extraGuestFeePerNight ?? null,
      guestsMax: guestsMax || null,
      minCheckInDate: tomorrowIsoDate(),
    });
  } catch (error) {
    console.error("[availability]", error);
    return NextResponse.json(
      { error: "Failed to load availability" },
      { status: 500 }
    );
  }
}
