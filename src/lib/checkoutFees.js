function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

const LOCALE_TITLE_KEYS = {
  es: "titleEs",
  de: "titleDe",
  nl: "titleNl",
  fr: "titleFr",
  ja: "titleJa",
  pt: "titlePt",
};

/** Normalize Sanity catalog + legacy single service fee fallback. */
export function normalizeCheckoutFees(settings = {}) {
  const catalog = settings.checkoutFeeCatalog;
  if (Array.isArray(catalog) && catalog.length > 0) {
    return catalog
      .map((row, index) => ({
        feeId: row.feeId || row._key || `fee-${index}`,
        titleEn: row.title || row.titleEn || "Fee",
        titleEs: row.titleEs,
        titleDe: row.titleDe,
        titleNl: row.titleNl,
        titleFr: row.titleFr,
        titleJa: row.titleJa,
        titlePt: row.titlePt,
        feeType: row.feeType === "flat" ? "flat" : "percentage",
        amount: Number(row.amount) || 0,
        application: row.application === "perNight" ? "perNight" : "perStay",
      }))
      .filter((row) => row.amount > 0);
  }

  const legacyRate = Number(settings.serviceFeeRate);
  if (Number.isFinite(legacyRate) && legacyRate > 0) {
    return [
      {
        feeId: "legacy-service-fee",
        titleEn: settings.serviceFeeLabelEn || "Service fee",
        feeType: "percentage",
        amount: legacyRate,
        application: "perStay",
      },
    ];
  }

  return [];
}

export function resolveFeeTitle(fee, language = "en") {
  if (!fee) return "Fee";
  if (language === "en") return fee.titleEn || "Fee";
  const key = LOCALE_TITLE_KEYS[language];
  const localized = key ? fee[key] : "";
  return localized || fee.titleEn || "Fee";
}

export function calculateCheckoutFeeLines(fees, { staySubtotal, nights }) {
  const safeSubtotal = Math.max(0, Number(staySubtotal) || 0);
  const safeNights = Math.max(0, Math.floor(Number(nights) || 0));

  return (fees || []).map((fee) => {
    let subtotal = 0;
    if (fee.feeType === "percentage") {
      subtotal = roundCurrency((safeSubtotal * fee.amount) / 100);
    } else if (fee.application === "perNight") {
      subtotal = roundCurrency(fee.amount * Math.max(1, safeNights));
    } else {
      subtotal = roundCurrency(fee.amount);
    }

    return {
      feeId: fee.feeId,
      title: fee.titleEn,
      titleEn: fee.titleEn,
      titleEs: fee.titleEs,
      titleDe: fee.titleDe,
      titleNl: fee.titleNl,
      titleFr: fee.titleFr,
      titleJa: fee.titleJa,
      titlePt: fee.titlePt,
      feeType: fee.feeType,
      amount: fee.amount,
      application: fee.application,
      subtotal,
    };
  });
}

export function sumFeeLineSubtotals(feeLines = []) {
  return roundCurrency(
    feeLines.reduce((sum, line) => sum + (line.subtotal || 0), 0)
  );
}

export function formatFeeLineDetail(fee, language = "en") {
  if (fee.feeType === "percentage") {
    return `${fee.amount}%`;
  }
  if (fee.application === "perNight") {
    return language === "en" ? "per night" : fee.application;
  }
  return language === "en" ? "per stay" : fee.application;
}
