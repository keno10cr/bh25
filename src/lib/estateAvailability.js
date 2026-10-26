import {
  occupiedNightsFromStay,
  toIsoDateList,
  tomorrowIsoDate,
} from "./availabilityDates";
import { ensureAirbnbCalendarsFresh } from "./ical/syncAirbnb";
import { createSanityReadClient } from "./sanity/client";

const ESTATE_CALENDAR_QUERY = `{
  "blocked": *[_type == "blockedDate" && defined(property._ref) && endDate >= $from && !(_id in path("drafts.**"))]{
    "propertyId": property._ref, startDate, endDate
  },
  "paid": *[_type == "stayBooking" && paymentStatus == "paid" && defined(property._ref) && checkOut > $from && !(_id in path("drafts.**"))]{
    "propertyId": property._ref, checkIn, checkOut
  }
}`;

const LISTED_VILLA_IDS_QUERY = `*[_type == "property" && listed != false && defined(slug.current) && !(_id in path("drafts.**"))]._id`;

/**
 * Unavailable nights per villa from manual blocks, Airbnb imports and paid
 * website bookings, starting at `from`.
 * @returns {Promise<Map<string, Set<string>>>}
 */
export async function loadUnavailableNightsByVilla(client, from) {
  const calendar = await client.fetch(ESTATE_CALENDAR_QUERY, { from });
  const unavailable = new Map();
  const mark = (propertyId, dates) => {
    if (!unavailable.has(propertyId)) unavailable.set(propertyId, new Set());
    const set = unavailable.get(propertyId);
    dates.forEach((iso) => {
      if (iso >= from) set.add(iso);
    });
  };
  (calendar?.blocked || []).forEach((row) =>
    mark(row.propertyId, toIsoDateList(row.startDate, row.endDate))
  );
  (calendar?.paid || []).forEach((row) =>
    mark(row.propertyId, occupiedNightsFromStay(row.checkIn, row.checkOut))
  );
  return unavailable;
}

/**
 * Collapses per villa nights into estate level dates, so public pages never
 * learn which villa is taken.
 */
export function summarizeEstateNights(villaIds, unavailableByVilla) {
  const counts = new Map();
  villaIds.forEach((id) => {
    (unavailableByVilla.get(id) || []).forEach((iso) => {
      counts.set(iso, (counts.get(iso) || 0) + 1);
    });
  });
  const partialDates = [];
  const fullDates = [];
  counts.forEach((count, iso) => {
    if (villaIds.length && count >= villaIds.length) fullDates.push(iso);
    else partialDates.push(iso);
  });
  return { partialDates: partialDates.sort(), fullDates: fullDates.sort() };
}

export async function loadEstateAvailability() {
  await ensureAirbnbCalendarsFresh();
  const client = createSanityReadClient();
  const from = tomorrowIsoDate();
  const [villaIds, unavailableByVilla] = await Promise.all([
    client.fetch(LISTED_VILLA_IDS_QUERY),
    loadUnavailableNightsByVilla(client, from),
  ]);
  return {
    minDate: from,
    ...summarizeEstateNights(villaIds || [], unavailableByVilla),
  };
}
