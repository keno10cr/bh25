/**
 * Stay pricing + URL quote encode/decode (STADA pattern).
 */

export function encodeBookingQuote(payload) {
  const json = JSON.stringify(payload);
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeBookingQuote(encoded) {
  if (!encoded || typeof encoded !== "string") return null;
  try {
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    let json;
    if (typeof window === "undefined") {
      json = Buffer.from(base64, "base64").toString("utf8");
    } else {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      json = new TextDecoder().decode(bytes);
    }
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed.total !== "number" || !Array.isArray(parsed.lines)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function seasonLabelForDate(iso, seasons, untitledSeasonLabel) {
  for (const season of seasons || []) {
    if (iso >= season.startDate && iso <= season.endDate) {
      return season.titleEn?.trim() || untitledSeasonLabel;
    }
  }
  return null;
}

export function buildStayPricing(
  nightIsos,
  pricingMap,
  seasons,
  fallbackNightlyRate,
  regularDayLabel = "Regular day",
  untitledSeasonLabel = "Season"
) {
  const bucket = new Map();

  for (const iso of nightIsos) {
    const rate = pricingMap?.[iso] ?? fallbackNightlyRate;
    const seasonalTitle = seasonLabelForDate(iso, seasons, untitledSeasonLabel);
    const label = seasonalTitle || regularDayLabel;
    const key = `${label}::${rate}`;
    const existing = bucket.get(key);
    if (existing) {
      existing.count += 1;
      existing.subtotal += rate;
    } else {
      bucket.set(key, { label, rate, count: 1, subtotal: rate });
    }
  }

  const lines = Array.from(bucket.values()).map((entry) => ({
    label: entry.label,
    count: entry.count,
    rate: entry.rate,
    subtotal: entry.subtotal,
  }));

  lines.sort((a, b) => {
    if (a.label === regularDayLabel && b.label !== regularDayLabel) return -1;
    if (b.label === regularDayLabel && a.label !== regularDayLabel) return 1;
    return a.label.localeCompare(b.label);
  });

  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  return { nightlyTotal: total, extraGuest: null, total, lines };
}

export function computeExtraGuestStayFee({ nights, extraGuests, feePerNight }) {
  const safeNights = Number.isFinite(nights) ? Math.max(0, Math.floor(nights)) : 0;
  const safeExtras = Number.isFinite(extraGuests)
    ? Math.max(0, Math.floor(extraGuests))
    : 0;
  const fee =
    Number.isFinite(feePerNight) && feePerNight > 0 ? feePerNight : 0;
  if (safeNights <= 0 || safeExtras <= 0 || fee <= 0) return null;
  const subtotal = Math.round(safeExtras * fee * safeNights * 100) / 100;
  return {
    extraGuests: safeExtras,
    feePerNight: fee,
    nights: safeNights,
    subtotal,
  };
}

export function withExtraGuestStayFee(stay, extraGuest) {
  const extra = extraGuest && extraGuest.subtotal > 0 ? extraGuest : null;
  return {
    ...stay,
    extraGuest: extra,
    total: stay.nightlyTotal + (extra?.subtotal ?? 0),
  };
}

export function buildBookingQueryString({
  propertySlug,
  checkIn,
  checkOut,
  adults,
  children = 0,
  pets = 0,
  quote,
}) {
  const params = new URLSearchParams();
  if (propertySlug) params.set("property", propertySlug);
  if (checkIn) params.set("checkIn", checkIn);
  if (checkOut) params.set("checkOut", checkOut);
  if (adults) params.set("adults", String(adults));
  if (children) params.set("children", String(children));
  if (pets) params.set("pets", String(pets));
  if (quote) params.set("quote", encodeBookingQuote(quote));
  return params.toString();
}
