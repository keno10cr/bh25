function isMissingTranslation(translated, lookup) {
  if (!translated) return true;
  const text = String(translated);
  return text === lookup || text.startsWith("activitiesPage.");
}

export function displayMeta(t, prefix, value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (raw.startsWith("activitiesPage.")) {
    return raw.replace(/^activitiesPage\.[^.]+\./, "") || raw;
  }

  const candidates = [
    raw,
    raw.replace(/ to /g, "-"),
    raw.replace(/ to /g, " - "),
  ];

  for (const candidate of candidates) {
    const lookup = `${prefix}.${candidate}`;
    const translated = t(lookup);
    if (!isMissingTranslation(translated, lookup)) {
      return translated;
    }
  }

  return raw;
}
