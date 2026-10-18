/**
 * Colón display prices. Everything is stored and charged in USD; colones are
 * USD × base rate × buffer, rounded to the nearest ₡1,000.
 */

export const CRC_BUFFER = 1.12;
export const CRC_ROUNDING = 1000;

export function crcRate(baseRate) {
  const n = Number(baseRate);
  return Number.isFinite(n) && n > 0 ? n * CRC_BUFFER : null;
}

/** A USD price (nightly rate, fee, add on) as a rounded colón price. */
export function usdToCrc(usd, baseRate) {
  const rate = crcRate(baseRate);
  const value = Number(usd);
  if (!rate || !Number.isFinite(value)) return 0;
  return Math.round((value * rate) / CRC_ROUNDING) * CRC_ROUNDING;
}

/** Converts an amount that is not a list price (totals, fixed discounts) without rounding. */
export function convertAmount(amount, from, to, baseRate) {
  const value = Number(amount) || 0;
  const rate = crcRate(baseRate);
  if (from === to || !rate) return value;
  return from === "USD" ? value * rate : value / rate;
}

export function formatCrc(amount) {
  const value = Number.isFinite(amount) ? amount : 0;
  return `₡${Math.round(value).toLocaleString("en-US")}`;
}

/** Same property with every price field in colones, so the pricing helpers work unchanged. */
export function propertyInCrc(property, baseRate) {
  if (!property) return property;
  const convert = (value) =>
    typeof value === "number" && Number.isFinite(value) ? usdToCrc(value, baseRate) : value;
  return {
    ...property,
    currency: "CRC",
    priceMin: convert(property.priceMin),
    priceMax: convert(property.priceMax),
    extraGuestFeePerNight: convert(property.extraGuestFeePerNight),
    cleaningFee: convert(property.cleaningFee),
    seasonalPricing: (property.seasonalPricing || []).map((season) => ({
      ...season,
      price: convert(season.price),
    })),
  };
}
