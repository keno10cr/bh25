const LOCALE_SUFFIX = {
  es: "Es",
  de: "De",
  nl: "Nl",
  fr: "Fr",
  ja: "Ja",
  pt: "Pt",
  ar: "Ar",
};

export function localizedField(doc, field, language = "en") {
  if (!doc) return "";
  if (!language || language === "en") return doc[field] || "";
  const suffix = LOCALE_SUFFIX[language];
  if (!suffix) return doc[field] || "";
  return doc[`${field}${suffix}`] || doc[field] || "";
}

export function localizedOnly(doc, field, language = "en") {
  if (!doc || !language || language === "en") return "";
  const suffix = LOCALE_SUFFIX[language];
  return (suffix && doc[`${field}${suffix}`]) || "";
}

export function localizedArray(doc, field, language = "en") {
  if (!doc) return [];
  if (!language || language === "en") {
    return Array.isArray(doc[field]) ? doc[field].filter(Boolean) : [];
  }
  const suffix = LOCALE_SUFFIX[language];
  const localized =
    suffix && Array.isArray(doc[`${field}${suffix}`])
      ? doc[`${field}${suffix}`].filter(Boolean)
      : [];
  if (localized.length > 0) return localized;
  return Array.isArray(doc[field]) ? doc[field].filter(Boolean) : [];
}
