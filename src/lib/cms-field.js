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

export function resolveCopy(field, translatedFallback) {
  if (field?.fromCms) {
    return { value: field.value, fromCms: true };
  }
  return { value: translatedFallback, fromCms: false };
}
