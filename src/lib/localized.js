const LOCALE_SUFFIX = {
  es: "Es",
  de: "De",
  nl: "Nl",
  fr: "Fr",
  ja: "Ja",
  pt: "Pt",
};

export function localizedField(doc, field, language = "en") {
  if (!doc) return "";
  if (!language || language === "en") return doc[field] || "";
  const suffix = LOCALE_SUFFIX[language];
  if (!suffix) return doc[field] || "";
  return doc[`${field}${suffix}`] || doc[field] || "";
}
