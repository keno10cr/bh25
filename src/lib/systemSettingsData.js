import { sanityFetch } from "@/lib/sanity/fetch";
import { stayDiscountPercents } from "@/lib/stayDiscounts";

function stayDiscountPercentsAsSettings(doc) {
  const percents = stayDiscountPercents(doc || {});
  return {
    weeklyDiscountPercent: percents.weekly,
    monthlyDiscountPercent: percents.monthly,
  };
}

const SYSTEM_SETTINGS_QUERY = `*[_type == "systemSettings" && !(_id in path("drafts.**"))][0]{
  taxRate,
  taxLabelEn,
  currency,
  paymentsEnabled,
  paymentProviders,
  checkoutFeeCatalog,
  serviceFeeRate,
  serviceFeeLabelEn,
  crcBaseRate,
  weeklyDiscountPercent,
  monthlyDiscountPercent
}`;

export async function getSystemSettings() {
  const doc = await sanityFetch(SYSTEM_SETTINGS_QUERY);
  return {
    taxRate: typeof doc?.taxRate === "number" ? doc.taxRate : 13,
    taxLabelEn: doc?.taxLabelEn || "Tax",
    currency: doc?.currency || "USD",
    paymentsEnabled: Boolean(doc?.paymentsEnabled),
    paymentProviders: Array.isArray(doc?.paymentProviders)
      ? doc.paymentProviders
      : ["stripe"],
    checkoutFeeCatalog: Array.isArray(doc?.checkoutFeeCatalog)
      ? doc.checkoutFeeCatalog
      : [],
    serviceFeeRate:
      typeof doc?.serviceFeeRate === "number" ? doc.serviceFeeRate : null,
    serviceFeeLabelEn: doc?.serviceFeeLabelEn || "Service fee",
    crcBaseRate:
      typeof doc?.crcBaseRate === "number" && doc.crcBaseRate > 0
        ? doc.crcBaseRate
        : null,
    ...stayDiscountPercentsAsSettings(doc),
  };
}
