function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function legendSlugs(activity) {
  const fromLegend = (activity?.legendItems || []).map((item) =>
    slugify(item.slug || item.title)
  );
  const fromCategory = slugify(activity?.category);
  return [...fromLegend, fromCategory].filter(Boolean);
}

export function isGroupOnlyActivity(activity) {
  return Boolean(activity?.groupOnly);
}

export function isTransportActivity(activity) {
  const hay = `${activity?.slug || ""} ${activity?.translationKey || ""}`.toLowerCase();
  return (
    legendSlugs(activity).includes("transport") ||
    /staria|shuttle|airport/.test(hay)
  );
}

export function isMealsActivity(activity) {
  const hay = `${activity?.slug || ""} ${activity?.translationKey || ""}`.toLowerCase();
  return (
    legendSlugs(activity).includes("dining") ||
    /meal|breakfast|cater/.test(hay)
  );
}

export function splitProposalActivities(activities = []) {
  const transport = activities.filter(isTransportActivity);
  const meals = activities.filter(isMealsActivity);
  const local = activities.filter((activity) => {
    if (
      isTransportActivity(activity) ||
      isMealsActivity(activity) ||
      isGroupOnlyActivity(activity)
    ) {
      return false;
    }
    return legendSlugs(activity).some((slug) =>
      ["beaches", "tours", "waterfalls"].includes(slug)
    );
  });

  return { transport, meals, local };
}

export function formatCoordinates(coordinates) {
  const lat = Number(coordinates?.lat);
  const lng = Number(coordinates?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function mapsUrl(coordinates) {
  const formatted = formatCoordinates(coordinates);
  if (!formatted) return "";
  return `https://www.google.com/maps?q=${formatted.replace(/\s/g, "")}`;
}
