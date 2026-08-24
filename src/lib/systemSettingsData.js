import { sanityFetch } from "@/lib/sanity/fetch";

const SYSTEM_SETTINGS_QUERY = `*[_type == "systemSettings" && !(_id in path("drafts.**"))][0]{
  taxRate,
  taxLabelEn,
  currency,
  paymentsEnabled,
  paymentProviders,
  checkoutFeeCatalog,
  serviceFeeRate,
  serviceFeeLabelEn
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
      typeof doc?.serviceFeeRate === "number" ? doc.serviceFeeRate : 9,
    serviceFeeLabelEn: doc?.serviceFeeLabelEn || "Service fee",
  };
}
