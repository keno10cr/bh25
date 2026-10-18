import {
  calculateCheckoutFeeLines,
  resolvePropertyFees,
  sumFeeLineSubtotals,
} from "./checkoutFees";
import {
  resolveLengthOfStayDiscount,
  stayDiscountAmount,
  stayDiscountPercents,
} from "./stayDiscounts";

export {
  getLocalizedHouseRules,
  getHouseRulesForDisplay,
  getOrderedHouseRuleCards,
  formatPartiesPolicy,
} from "./houseRules";

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function buildCheckoutPriceSummary({
  currency = "USD",
  nights,
  nightlyRate,
  subtotalOverride,
  taxRate = 0,
  settings,
  property = null,
}) {
  const safeNights = Number.isFinite(nights) ? Math.max(0, Math.floor(nights)) : 0;
  const safeNightlyRate = Number.isFinite(nightlyRate) ? Math.max(0, nightlyRate) : 0;
  const subtotal =
    typeof subtotalOverride === "number" && Number.isFinite(subtotalOverride)
      ? roundCurrency(Math.max(0, subtotalOverride))
      : roundCurrency(safeNightlyRate * safeNights);

  const stayRule = resolveLengthOfStayDiscount(
    safeNights,
    stayDiscountPercents(settings || {})
  );
  const stayDiscount = stayRule
    ? { ...stayRule, amount: stayDiscountAmount(subtotal, stayRule.percent) }
    : null;
  const discountedSubtotal = roundCurrency(subtotal - (stayDiscount?.amount ?? 0));

  const feeConfigs = resolvePropertyFees(settings || {}, property);

  const feeLines = calculateCheckoutFeeLines(feeConfigs, {
    staySubtotal: discountedSubtotal,
    nights: safeNights,
  });
  const feesTotal = sumFeeLineSubtotals(feeLines);
  const taxes = roundCurrency(
    ((discountedSubtotal + feesTotal) * Math.max(0, taxRate)) / 100
  );
  const total = roundCurrency(discountedSubtotal + feesTotal + taxes);

  return {
    currency,
    nights: safeNights,
    nightlyRate: safeNightlyRate,
    subtotal,
    stayDiscount,
    discountedSubtotal,
    feeLines,
    feesTotal,
    fees: feesTotal,
    taxes,
    total,
  };
}

export function formatMoney(amount, currency = "USD") {
  const value = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function formatStayDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
