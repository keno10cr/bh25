/** Date helpers for availability without pulling date-fns. */

function parseIsoDate(iso) {
  if (!iso || typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function formatIsoDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addUtcDays(date, days) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Inclusive list of ISO dates from startDate through endDate. */
export function toIsoDateList(startDate, endDate) {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end || start > end) return [];
  const out = [];
  for (let cursor = start; cursor <= end; cursor = addUtcDays(cursor, 1)) {
    out.push(formatIsoDate(cursor));
  }
  return out;
}

/**
 * Nights occupied by a stay: check-in through the night before check-out.
 * Check-out day itself stays available for the next arrival.
 */
export function occupiedNightsFromStay(checkIn, checkOut) {
  const start = parseIsoDate(checkIn);
  const end = parseIsoDate(checkOut);
  if (!start || !end || end <= start) return [];
  const lastNight = addUtcDays(end, -1);
  return toIsoDateList(formatIsoDate(start), formatIsoDate(lastNight));
}

export function tomorrowIsoDate() {
  const now = new Date();
  const utc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  return formatIsoDate(addUtcDays(utc, 1));
}
