import { occupiedNightsFromStay, toIsoDateList } from "./availabilityDates";

export const BLOCKED_DATES_QUERY = `
*[_type == "blockedDate" && property._ref == $propertyId && !(_id in path("drafts.**"))]{
  _id,
  title,
  startDate,
  endDate,
  source,
  reason
}
`;

export const PAID_BOOKINGS_QUERY = `
*[_type == "stayBooking"
  && property._ref == $propertyId
  && paymentStatus == "paid"
  && !(_id in path("drafts.**"))]{
  _id,
  checkIn,
  checkOut,
  "blockId": blockedDateRef._ref
}
`;

export function collectDisabledNights(blockedDocs, paidBookings) {
  const disabled = new Set();
  for (const blocked of blockedDocs || []) {
    if (!blocked?.startDate || !blocked?.endDate) continue;
    for (const iso of toIsoDateList(blocked.startDate, blocked.endDate)) {
      disabled.add(iso);
    }
  }
  for (const booking of paidBookings || []) {
    for (const iso of occupiedNightsFromStay(booking.checkIn, booking.checkOut)) {
      disabled.add(iso);
    }
  }
  return disabled;
}

export function conflictingNights(checkIn, checkOut, disabledNights) {
  return occupiedNightsFromStay(checkIn, checkOut).filter((iso) =>
    disabledNights?.has(iso)
  );
}

/** Manual blocks only. Booking mirrors and Airbnb rows are exported separately or not at all. */
export function manualBlocksForExport(blockedDocs, paidBookings) {
  const linked = new Set(
    (paidBookings || []).map((booking) => booking.blockId).filter(Boolean)
  );
  return (blockedDocs || []).filter(
    (block) =>
      block?.source !== "airbnb" &&
      block?.startDate &&
      block?.endDate &&
      !linked.has(block._id)
  );
}

/** Inclusive ranges already closed by the website, used to ignore echoed Airbnb events. */
export function websiteOccupiedRanges(blockedDocs, paidBookings) {
  const ranges = [];
  for (const booking of paidBookings || []) {
    const nights = occupiedNightsFromStay(booking.checkIn, booking.checkOut);
    if (!nights.length) continue;
    ranges.push({ startDate: nights[0], endDate: nights.at(-1) });
  }
  for (const block of blockedDocs || []) {
    if (block?.source === "airbnb" || !block?.startDate || !block?.endDate) continue;
    ranges.push({ startDate: block.startDate, endDate: block.endDate });
  }
  return ranges;
}

export async function loadPropertyCalendar(client, propertyId) {
  const [blockedDocs, paidBookings] = await Promise.all([
    client.fetch(BLOCKED_DATES_QUERY, { propertyId }),
    client.fetch(PAID_BOOKINGS_QUERY, { propertyId }),
  ]);
  return {
    blockedDocs: blockedDocs || [],
    paidBookings: paidBookings || [],
    disabledNights: collectDisabledNights(blockedDocs, paidBookings),
  };
}
