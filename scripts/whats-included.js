const WHATS_INCLUDED_LOCALE_SUFFIXES = ["", "Es", "De", "Nl", "Fr", "Ja", "Pt"];

export function whatsIncludedKey(label, index, prefix = "wi") {
  const slug = String(label || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `${prefix}-${index}-${slug || "item"}`;
}

export function toWhatsIncludedItems(values, prefix = "wi") {
  if (!Array.isArray(values)) return [];

  return values
    .map((item, index) => {
      if (typeof item === "string") {
        const label = item.trim();
        if (!label) return null;
        return {
          _key: whatsIncludedKey(label, index, prefix),
          label,
        };
      }

      const label = String(item?.label || "").trim();
      if (!label) return null;
      return {
        _key: item?._key || whatsIncludedKey(label, index, prefix),
        label,
      };
    })
    .filter(Boolean);
}

export function whatsIncludedLabels(values) {
  return toWhatsIncludedItems(values).map((item) => item.label);
}

export function normalizeWhatsIncludedFields(doc, prefix = "wi") {
  if (!doc || typeof doc !== "object") return {};

  const patch = {};
  WHATS_INCLUDED_LOCALE_SUFFIXES.forEach((suffix) => {
    const fieldName = suffix ? `whatsIncluded${suffix}` : "whatsIncluded";
    const raw = doc[fieldName];
    if (!Array.isArray(raw) || raw.length === 0) return;
    patch[fieldName] = toWhatsIncludedItems(raw, `${prefix}${suffix || "En"}`);
  });

  return patch;
}

export { WHATS_INCLUDED_LOCALE_SUFFIXES };
