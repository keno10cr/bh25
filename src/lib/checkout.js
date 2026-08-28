import {
  calculateCheckoutFeeLines,
  normalizeCheckoutFees,
  sumFeeLineSubtotals,
} from "./checkoutFees";

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
}) {
  const safeNights = Number.isFinite(nights) ? Math.max(0, Math.floor(nights)) : 0;
  const safeNightlyRate = Number.isFinite(nightlyRate) ? Math.max(0, nightlyRate) : 0;
  const subtotal =
    typeof subtotalOverride === "number" && Number.isFinite(subtotalOverride)
      ? roundCurrency(Math.max(0, subtotalOverride))
      : roundCurrency(safeNightlyRate * safeNights);

  const feeConfigs = normalizeCheckoutFees(settings || {});

  const feeLines = calculateCheckoutFeeLines(feeConfigs, {
    staySubtotal: subtotal,
    nights: safeNights,
  });
  const feesTotal = sumFeeLineSubtotals(feeLines);
  const taxes = roundCurrency(
    ((subtotal + feesTotal) * Math.max(0, taxRate)) / 100
  );
  const total = roundCurrency(subtotal + feesTotal + taxes);

  return {
    currency,
    nights: safeNights,
    nightlyRate: safeNightlyRate,
    subtotal,
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
