/**
 * Pricing helpers for bookable properties.
 * Empty CMS values fall back to inclusive defaults (same rules as STADA).
 */

export function getDefaultPublishedNightly(property) {
  const min = Number(property?.priceMin ?? property?.price?.min);
  const max = Number(property?.priceMax ?? property?.price?.max);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return 0;
  return Math.round((min + max) / 2);
}

/** Empty CMS value → 1 night (no extra restriction). */
export function resolveMinimumNights(property) {
  const n = property?.minimumNights;
  if (typeof n === "number" && Number.isFinite(n) && n >= 1) return Math.floor(n);
  return 1;
}

/**
 * Empty CMS value → all guests up to capacity are included.
 * Capacity prefers houseArrangements sum when provided on the mapped property.
 */
export function resolveBaseGuestCount(property) {
  const cap = Math.max(
    1,
    Math.floor(
      property?.guestsMax ??
        property?.guests?.max ??
        property?.capacity ??
        1
    )
  );
  const n = property?.baseGuestCount;
  if (typeof n === "number" && Number.isFinite(n) && n >= 1) {
    return Math.min(Math.floor(n), cap);
  }
  return cap;
}

/** Empty or 0 CMS value → no extra guest charges. */
export function resolveExtraGuestFeePerNight(property) {
  const n = property?.extraGuestFeePerNight;
  if (typeof n === "number" && Number.isFinite(n) && n > 0) return n;
  return 0;
}

/** Adults + children above the included base, capped at property capacity. Pets excluded. */
export function extraGuestCount(totalHumanGuests, property) {
  const max = Math.max(
    0,
    Math.floor(
      property?.guestsMax ?? property?.guests?.max ?? property?.capacity ?? 0
    )
  );
  const capped = Math.max(0, Math.min(Math.floor(totalHumanGuests || 0), max));
  return Math.max(0, capped - resolveBaseGuestCount(property));
}

export function sumHouseArrangementCapacity(houseArrangements = []) {
  return houseArrangements.reduce((sum, row) => {
    const qty = Math.max(0, Math.floor(row?.quantity || 0));
    const sleeps = Math.max(0, Math.floor(row?.roomType?.capacity || 0));
    return sum + qty * sleeps;
  }, 0);
}

export function quoteStay({
  property,
  nights,
  guestCount,
  nightlySubtotal,
  taxRate = 0,
  serviceFeeRate = 0,
}) {
  const extras =
    extraGuestCount(guestCount, property) *
    resolveExtraGuestFeePerNight(property) *
    Math.max(0, nights);
  const serviceFee = ((nightlySubtotal + extras) * serviceFeeRate) / 100;
  const tax = ((nightlySubtotal + extras + serviceFee) * taxRate) / 100;
  const total = nightlySubtotal + extras + serviceFee + tax;
  return {
    nightlySubtotal,
    extraGuestFees: extras,
    serviceFee,
    tax,
    total,
  };
}
