import ical from "ical-generator";
import { addIsoDays } from "../availabilityDates.js";
import { SITE_URL } from "../siteMetadata.js";
import { blockEventUid, bookingEventUid, EXPORT_CACHE_SECONDS } from "./constants.js";

function propertyLabel(property) {
  return property?.nameEn || property?.name || "Blessed House villa";
}

/**
 * All-day DTEND is the checkout morning, not the last night. Pass ISO dates
 * (UTC midnight) and leave the calendar timezone unset so the day does not shift.
 */
export function buildPropertyCalendar({ property, bookings, blocks }) {
  const slug = property?.slug || "villa";
  const feedUrl = `${SITE_URL}/api/ical/${slug}`;
  const calendar = ical({
    name: `${propertyLabel(property)} · Blessed House`,
    prodId: {
      company: "Blessed House",
      product: "Website Calendar",
      language: "EN",
    },
    url: feedUrl,
    ttl: EXPORT_CACHE_SECONDS,
  });

  for (const booking of bookings || []) {
    if (!booking?._id || !booking.checkIn || !booking.checkOut) continue;
    if (booking.checkOut <= booking.checkIn) continue;
    calendar.createEvent({
      id: bookingEventUid(booking._id),
      start: booking.checkIn,
      end: booking.checkOut,
      allDay: true,
      summary: "Reserved",
      description: "Blocked on the Blessed House website.",
      busystatus: "BUSY",
      x: { "X-BH-ORIGIN": "website" },
    });
  }

  for (const block of blocks || []) {
    if (!block?._id || !block.startDate || !block.endDate) continue;
    const end = addIsoDays(block.endDate, 1);
    if (!end || end <= block.startDate) continue;
    calendar.createEvent({
      id: blockEventUid(block._id),
      start: block.startDate,
      end,
      allDay: true,
      summary: "Reserved",
      description: "Blocked on the Blessed House website.",
      busystatus: "BUSY",
      x: { "X-BH-ORIGIN": "website" },
    });
  }

  return calendar.toString();
}

export function icsFilename(slug) {
  const safe = String(slug || "villa")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `blessed-house-${safe || "villa"}.ics`;
}
