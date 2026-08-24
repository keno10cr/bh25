import {
  calculateCheckoutFeeLines,
  normalizeCheckoutFees,
  sumFeeLineSubtotals,
} from "./checkoutFees";

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

function textToBlocks(text, prefix = "rule") {
  return String(text || "")
    .split(/\n\n+/)
    .filter(Boolean)
    .map((paragraph, index) => ({
      _type: "block",
      _key: `${prefix}-${index}`,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `${prefix}-s${index}`,
          text: paragraph,
          marks: [],
        },
      ],
    }));
}

export function getLocalizedHouseRules(property) {
  const rules = property?.houseRules;
  const areaRules =
    rules?.areaRules
      ?.map((rule) => ({
        title: rule.titleEn || rule.title,
        body: rule.bodyEn || rule.body || [],
      }))
      .filter((rule) => rule.title && Array.isArray(rule.body) && rule.body.length > 0) ||
    [];

  const petsMax = property?.petsMax ?? property?.guests?.petsMax ?? 0;

  if (areaRules.length > 0) {
    return {
      areaRules,
      review: {
        smoking:
          rules?.review?.smokingEn ||
          "Smoking is not allowed inside the property.",
        dogs:
          rules?.review?.dogsEn ||
          (petsMax > 0
            ? `Up to ${petsMax} pets are allowed with prior approval.`
            : "Pets are not allowed at this property."),
        parties:
          rules?.review?.partiesEn ||
          "Parties, events, and unauthorized gatherings are not permitted.",
        quietHours:
          rules?.review?.quietHoursEn ||
          "Please respect quiet hours from 10:00 PM to 8:00 AM.",
      },
    };
  }

  return {
    areaRules: [
      {
        title: "Stay policy",
        body: textToBlocks(
          "Registered guests must respect the approved occupancy limit and follow the check in instructions shared before arrival."
        ),
      },
      {
        title: "Property care",
        body: textToBlocks(
          "Please help us keep the villa in excellent condition. Report any incident or damage as soon as it occurs."
        ),
      },
    ],
    review: {
      smoking: "Smoking is not allowed inside the property.",
      dogs:
        petsMax > 0
          ? `Up to ${petsMax} pets are allowed with prior approval.`
          : "Pets are not allowed at this property.",
      parties: "Parties, events, and unauthorized gatherings are not permitted.",
      quietHours: "Please respect quiet hours from 10:00 PM to 8:00 AM.",
    },
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
