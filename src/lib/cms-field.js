export function cmsField(cmsValue, fallbackValue) {
  const emptyArray = Array.isArray(cmsValue) && cmsValue.length === 0;
  const hasCms =
    cmsValue !== undefined &&
    cmsValue !== null &&
    cmsValue !== "" &&
    !emptyArray;

  return {
    value: hasCms ? cmsValue : fallbackValue,
    fromCms: hasCms,
  };
}

/**
 * Prefer the UI translation when the visitor language is not English.
 * English CMS remains the Studio source of truth; locale fields are filled
 * by scripts/fill-cms-translations.js for editing, while the live site uses
 * translations.js for non English visitors.
 */
export function resolveCopy(field, translatedFallback, language = "en") {
  if (language && language !== "en" && translatedFallback) {
    return { value: translatedFallback, fromCms: false };
  }
  if (field?.fromCms) {
    return { value: field.value, fromCms: true };
  }
  return { value: translatedFallback, fromCms: false };
}

export function useUiCopy(language) {
  return Boolean(language && language !== "en");
}
