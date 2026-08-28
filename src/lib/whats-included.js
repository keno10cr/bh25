export function whatsIncludedLabels(values) {
  if (!Array.isArray(values)) return [];

  return values
    .map((item) => {
      if (typeof item === "string") return item.trim();
      return String(item?.label || "").trim();
    })
    .filter(Boolean);
}
