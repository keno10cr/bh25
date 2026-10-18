import ical from "node-ical";
import { addIsoDays } from "../availabilityDates.js";

function formatLocalIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatUtcIso(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDateOnly(value, datetype) {
  return datetype === "date" || Boolean(value?.dateOnly);
}

/**
 * Date-only iCal values are local midnights. UTC getters shift them backward
 * in Costa Rica, so all-day events use the local calendar day.
 */
function dayOf(value, dateOnly) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
  return dateOnly ? formatLocalIso(value) : formatUtcIso(value);
}

function isUtcMidnight(value) {
  return (
    value.getUTCHours() === 0 &&
    value.getUTCMinutes() === 0 &&
    value.getUTCSeconds() === 0 &&
    value.getUTCMilliseconds() === 0
  );
}

function isWebsiteOrigin(uid, item) {
  const origin = String(item["BH-ORIGIN"] || "").toLowerCase();
  return (
    uid.startsWith("bh-booking-") ||
    uid.startsWith("bh-block-") ||
    uid.toLowerCase().endsWith("@blessedhouse.info") ||
    origin === "website"
  );
}

/**
 * Inclusive last night. VALUE=DATE end is the morning of checkout, so the
 * last occupied night is the day before DTEND.
 */
function inclusiveEnd(startDate, endValue, dateOnly) {
  if (!(endValue instanceof Date) || Number.isNaN(endValue.getTime())) {
    return startDate;
  }
  const endIsDate = dateOnly || Boolean(endValue.dateOnly);
  const endDay = dayOf(endValue, endIsDate);
  if (!endDay) return startDate;
  const exclusive = endIsDate || isUtcMidnight(endValue);
  if (!exclusive) return endDay >= startDate ? endDay : startDate;
  const inclusive = addIsoDays(endDay, -1);
  if (!inclusive || inclusive < startDate) return startDate;
  return inclusive;
}

export function readCalendarEvents(icsText) {
  const parsed = ical.parseICS(String(icsText || ""));
  const byUid = new Map();

  for (const item of Object.values(parsed)) {
    if (!item || item.type !== "VEVENT") continue;
    const dateOnly = isDateOnly(item.start, item.datetype);
    const startDate = dayOf(item.start, dateOnly);
    if (!startDate) continue;
    const endDate = inclusiveEnd(startDate, item.end, dateOnly);
    const summary = String(item.summary || "")
      .replace(/\s+/g, " ")
      .trim();
    const uid = String(item.uid || `${startDate}/${endDate}/${summary}`);
    byUid.set(uid, {
      uid,
      summary,
      status: String(item.status || "").toUpperCase(),
      startDate,
      endDate,
      websiteOrigin: isWebsiteOrigin(uid, item),
    });
  }

  return Array.from(byUid.values());
}

export function selectAirbnbBlocks(events, { earliestIso } = {}) {
  return (events || []).filter((event) => {
    if (!event?.startDate || !event?.endDate) return false;
    if (event.websiteOrigin) return false;
    if (event.status === "CANCELLED") return false;
    if (earliestIso && event.endDate < earliestIso) return false;
    return true;
  });
}

export function blocksFromIcs(icsText, options) {
  return selectAirbnbBlocks(readCalendarEvents(icsText), options);
}

/** Drop Airbnb events that repeat a website booking or manual block exactly. */
export function withoutMatchingRanges(blocks, ranges) {
  const keys = new Set(
    (ranges || [])
      .filter((range) => range?.startDate && range?.endDate)
      .map((range) => `${range.startDate}/${range.endDate}`)
  );
  if (!keys.size) return blocks || [];
  return (blocks || []).filter(
    (block) => !keys.has(`${block.startDate}/${block.endDate}`)
  );
}
