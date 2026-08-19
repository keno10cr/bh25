export function villaImageCaption(src, villa, t) {
  const path = String(src || "");
  if (path.includes("charger")) return t("villas.gallery.charger");
  if (path.includes("junglepool")) return t("villas.gallery.junglePool");
  if (path.includes("general/map") || path.endsWith("/map.jpg")) {
    return t("villas.gallery.propertyMap");
  }
  if (path.includes("general/pool")) return t("villas.gallery.sharedPool");
  return t("villas.gallery.villaPhoto").replace("{name}", villa?.name || "Villa");
}
