import { createHash } from "node:crypto";

/** How long a stored Airbnb import stays fresh before the next fetch. */
export const AIRBNB_SYNC_TTL_MS = 20 * 60 * 1000;

/** Public export freshness. Matches the import window so Airbnb re-reads often. */
export const EXPORT_CACHE_SECONDS = 900;

export const SYNC_FETCH_TIMEOUT_MS = 12_000;

/** Page loads wait this long, then render with the blocks already stored. */
export const SYNC_PAGE_WAIT_MS = 20_000;

export const AIRBNB_FETCH_CONCURRENCY = 4;

export function bookingEventUid(bookingId) {
  return `bh-booking-${bookingId}@blessedhouse.info`;
}

export function blockEventUid(blockId) {
  return `bh-block-${blockId}@blessedhouse.info`;
}

export function airbnbBlockId(propertyId, uid) {
  const digest = createHash("sha256")
    .update(`${propertyId}\n${uid}`)
    .digest("hex")
    .slice(0, 32);
  return `airbnbBlock-${digest}`;
}

export function airbnbBlockTitle(summary) {
  const clean = String(summary || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
  if (!clean || clean.toLowerCase() === "reserved") return "Airbnb · Reserved";
  return `Airbnb · ${clean}`;
}
