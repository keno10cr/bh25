/**
 * Length of stay discounts, shared by the booking widget, checkout and /bhgr.
 * They apply to accommodation (nightly rates plus extra guest fees), never to
 * cleaning fees or tax. Monthly replaces weekly; they never stack.
 */

export const STAY_DISCOUNT_MIN_NIGHTS = { weekly: 7, monthly: 28 };
export const DEFAULT_STAY_DISCOUNT_PERCENTS = { weekly: 15, monthly: 30 };

function clampPercent(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n));
}

/** Percentages from System Settings, falling back to 15% weekly and 30% monthly. */
export function stayDiscountPercents(settings) {
  return {
    weekly: clampPercent(settings?.weeklyDiscountPercent, DEFAULT_STAY_DISCOUNT_PERCENTS.weekly),
    monthly: clampPercent(settings?.monthlyDiscountPercent, DEFAULT_STAY_DISCOUNT_PERCENTS.monthly),
  };
}

/** The discount a stay of `nights` earns, or null. */
export function resolveLengthOfStayDiscount(nights, percents = DEFAULT_STAY_DISCOUNT_PERCENTS) {
  for (const kind of ["monthly", "weekly"]) {
    const percent = clampPercent(percents?.[kind], 0);
    if (percent > 0 && nights >= STAY_DISCOUNT_MIN_NIGHTS[kind]) return { kind, percent };
  }
  return null;
}

export function stayDiscountAmount(subtotal, percent, decimals = 2) {
  const factor = 10 ** decimals;
  const value = ((Number(subtotal) || 0) * (Number(percent) || 0)) / 100;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

const LABELS = {
  en: { weekly: "Weekly stay discount", monthly: "Monthly stay discount" },
  es: { weekly: "Descuento por estadía semanal", monthly: "Descuento por estadía mensual" },
  de: { weekly: "Wochenrabatt", monthly: "Monatsrabatt" },
  nl: { weekly: "Weekkorting", monthly: "Maandkorting" },
  fr: { weekly: "Réduction à la semaine", monthly: "Réduction au mois" },
  ja: { weekly: "週間滞在割引", monthly: "月間滞在割引" },
  pt: { weekly: "Desconto semanal", monthly: "Desconto mensal" },
  ar: { weekly: "خصم الإقامة الأسبوعية", monthly: "خصم الإقامة الشهرية" },
};

export function stayDiscountLabel(discount, language = "en") {
  if (!discount) return "";
  const labels = LABELS[language] || LABELS.en;
  return `${labels[discount.kind] || LABELS.en[discount.kind]} (${discount.percent}%)`;
}
