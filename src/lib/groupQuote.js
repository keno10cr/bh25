/**
 * Multi villa quote math for /bhgr (Blessed House Group Reservations).
 * Uses the same Sanity driven helpers as the villa booking sidebar.
 */

import { buildStayPricing, computeExtraGuestStayFee } from "./bookingPricing";
import { occupiedNightsFromStay, toIsoDateList } from "./availabilityDates";
import {
  calculateCheckoutFeeLines,
  normalizeCheckoutFees,
  sumFeeLineSubtotals,
} from "./checkoutFees";
import {
  extraGuestCount,
  getDefaultPublishedNightly,
  resolveBaseGuestCount,
  resolveExtraGuestFeePerNight,
  resolveMinimumNights,
} from "./propertyPricing";

export const STANDARD_RATE_LABEL = "Standard rate";

export const STAY_DISCOUNT_MIN_NIGHTS = { weekly: 7, monthly: 28 };

/** Monthly replaces weekly, so a villa only ever gets one stay length discount. */
export function resolveStayDiscount(nights, stayDiscounts = {}) {
  for (const kind of ["monthly", "weekly"]) {
    const option = stayDiscounts[kind];
    const percent = Math.min(100, Number(option?.percent) || 0);
    if (option?.enabled && percent > 0 && nights >= STAY_DISCOUNT_MIN_NIGHTS[kind]) {
      return { kind, percent };
    }
  }
  return null;
}

export function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

export function seasonalPricingMap(seasons = []) {
  const map = {};
  seasons.forEach((season) => {
    if (!season?.startDate || !season?.endDate || typeof season.price !== "number") {
      return;
    }
    toIsoDateList(season.startDate, season.endDate).forEach((iso) => {
      map[iso] = season.price;
    });
  });
  return map;
}

export function quoteVillaStay({ property, checkIn, checkOut, guests }) {
  const nightIsos = occupiedNightsFromStay(checkIn, checkOut);
  const nights = nightIsos.length;
  if (!property || nights === 0) return null;

  const stay = buildStayPricing(
    nightIsos,
    seasonalPricingMap(property.seasonalPricing),
    property.seasonalPricing,
    getDefaultPublishedNightly(property),
    STANDARD_RATE_LABEL
  );
  const extraGuest = computeExtraGuestStayFee({
    nights,
    extraGuests: extraGuestCount(guests, property),
    feePerNight: resolveExtraGuestFeePerNight(property),
  });

  const lines = stay.lines.map((line) => ({ ...line, kind: "nightly" }));
  if (extraGuest) {
    lines.push({
      kind: "extraGuest",
      label: `Extra guests (${extraGuest.extraGuests})`,
      extraGuests: extraGuest.extraGuests,
      count: extraGuest.nights,
      rate: roundMoney(extraGuest.extraGuests * extraGuest.feePerNight),
      subtotal: extraGuest.subtotal,
    });
  }

  return {
    nights,
    nightIsos,
    lines,
    extraGuest,
    subtotal: roundMoney(lines.reduce((sum, line) => sum + line.subtotal, 0)),
  };
}

export function resolveDiscountAmount(subtotal, discount) {
  const value = Number(discount?.value);
  if (!Number.isFinite(value) || value <= 0 || subtotal <= 0) return 0;
  if (discount.type === "percent") {
    return roundMoney((subtotal * Math.min(value, 100)) / 100);
  }
  return roundMoney(Math.min(value, subtotal));
}

/** Splits `amount` across `weights` so the parts always add up to `amount` exactly. */
export function allocateProportionally(weights, amount) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0 || amount <= 0) return weights.map(() => 0);
  let remaining = roundMoney(amount);
  let lastWeighted = -1;
  weights.forEach((w, i) => {
    if (w > 0) lastWeighted = i;
  });
  return weights.map((w, i) => {
    if (w <= 0) return 0;
    if (i === lastWeighted) return roundMoney(remaining);
    const share = roundMoney((amount * w) / total);
    remaining = roundMoney(remaining - share);
    return share;
  });
}

export function unavailableNightsInStay(nightIsos, unavailableDates = []) {
  if (!nightIsos?.length || !unavailableDates.length) return [];
  const blocked = new Set(unavailableDates);
  return nightIsos.filter((iso) => blocked.has(iso));
}

/**
 * addOns: [{ id, category, name, unitPriceUsd, people, units }]
 * Amounts are left unrounded so items priced in colones convert back exactly.
 */
export function buildAddOnLines(addOns = []) {
  return addOns.map((item) => {
    const unitPriceUsd = Math.max(0, Number(item.unitPriceUsd) || 0);
    const people = Math.max(0, Math.floor(Number(item.people) || 0));
    const units = Math.max(0, Math.floor(Number(item.units) || 0));
    return { ...item, unitPriceUsd, people, units, total: unitPriceUsd * people * units };
  });
}

/**
 * selections: [{ property, checkIn, checkOut, guests }]
 * stayDiscounts: { weekly: { enabled, percent }, monthly: { enabled, percent } } per villa.
 * discount: { type: "percent" | "fixed", value } group discount, applied after stay discounts.
 * Both apply to villa rates only.
 * excludedFeeIds: checkout fees from System Settings left off this quote.
 */
export function buildGroupQuote({
  selections = [],
  stayDiscounts = {},
  discount,
  addOns = [],
  excludedFeeIds = [],
  includeTax = true,
  settings = {},
}) {
  const rows = selections.map((selection) => {
    const { property } = selection;
    const quote = quoteVillaStay(selection);
    const stayRule = quote ? resolveStayDiscount(quote.nights, stayDiscounts) : null;
    const stayDiscount = stayRule
      ? { ...stayRule, amount: roundMoney((quote.subtotal * stayRule.percent) / 100) }
      : null;
    return {
      ...selection,
      quote,
      stayDiscount,
      afterStayDiscount: roundMoney((quote?.subtotal ?? 0) - (stayDiscount?.amount ?? 0)),
      baseGuests: resolveBaseGuestCount(property),
      minimumNights: resolveMinimumNights(property),
      unavailableNights: unavailableNightsInStay(
        quote?.nightIsos,
        property.unavailableDates
      ),
    };
  });

  const subtotal = roundMoney(
    rows.reduce((sum, row) => sum + (row.quote?.subtotal ?? 0), 0)
  );
  const stayTotals = new Map();
  rows.forEach((row) => {
    if (!row.stayDiscount) return;
    const key = `${row.stayDiscount.kind}-${row.stayDiscount.percent}`;
    const existing = stayTotals.get(key);
    if (existing) existing.amount = roundMoney(existing.amount + row.stayDiscount.amount);
    else stayTotals.set(key, { ...row.stayDiscount });
  });
  const stayDiscountLines = Array.from(stayTotals.values()).sort(
    (a, b) => STAY_DISCOUNT_MIN_NIGHTS[a.kind] - STAY_DISCOUNT_MIN_NIGHTS[b.kind]
  );
  const stayDiscountTotal = roundMoney(
    stayDiscountLines.reduce((sum, line) => sum + line.amount, 0)
  );

  const groupDiscountAmount = resolveDiscountAmount(
    roundMoney(subtotal - stayDiscountTotal),
    discount
  );
  const groupShares = allocateProportionally(
    rows.map((row) => row.afterStayDiscount),
    groupDiscountAmount
  );
  const discountShares = rows.map((row, index) =>
    roundMoney((row.stayDiscount?.amount ?? 0) + groupShares[index])
  );
  const discountAmount = roundMoney(stayDiscountTotal + groupDiscountAmount);

  const excluded = new Set(excludedFeeIds);
  const feeConfigs = normalizeCheckoutFees(settings).filter(
    (fee) => !excluded.has(fee.feeId)
  );
  const feeTotals = new Map();

  rows.forEach((row, index) => {
    const share = discountShares[index];
    row.discountShare = share;
    row.netSubtotal = roundMoney((row.quote?.subtotal ?? 0) - share);
    row.netLines = netLinesFor(row.quote?.lines ?? [], share);

    if (!row.quote || feeConfigs.length === 0) {
      row.feeLines = [];
      return;
    }
    row.feeLines = calculateCheckoutFeeLines(feeConfigs, {
      staySubtotal: row.netSubtotal,
      nights: row.quote.nights,
    });
    row.feeLines.forEach((line) => {
      const existing = feeTotals.get(line.feeId);
      if (existing) existing.subtotal = roundMoney(existing.subtotal + line.subtotal);
      else feeTotals.set(line.feeId, { ...line });
    });
  });

  const netSubtotal = roundMoney(subtotal - discountAmount);
  const feeLines = Array.from(feeTotals.values());
  const feesTotal = sumFeeLineSubtotals(feeLines);
  const addOnLines = buildAddOnLines(addOns).filter((line) => line.total > 0);
  const addOnsTotal = addOnLines.reduce((sum, line) => sum + line.total, 0);
  const taxRate = includeTax ? Math.max(0, Number(settings.taxRate) || 0) : 0;
  const taxes = roundMoney(((netSubtotal + feesTotal + addOnsTotal) * taxRate) / 100);

  return {
    rows,
    subtotal,
    stayDiscountLines,
    stayDiscountTotal,
    groupDiscountAmount,
    discountAmount,
    netSubtotal,
    feeLines,
    feesTotal,
    addOnLines,
    addOnsTotal,
    taxRate,
    taxes,
    total: roundMoney(netSubtotal + feesTotal + taxes) + addOnsTotal,
    totalGuests: rows.reduce((sum, row) => sum + (row.guests || 0), 0),
  };
}

function netLinesFor(lines, discountShare) {
  const shares = allocateProportionally(
    lines.map((line) => line.subtotal),
    discountShare
  );
  return lines.map((line, index) => {
    const subtotal = roundMoney(line.subtotal - shares[index]);
    return {
      ...line,
      subtotal,
      rate: line.count > 0 ? roundMoney(subtotal / line.count) : line.rate,
    };
  });
}
