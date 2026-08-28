import { localizedArray } from "@/lib/localized";

export function resolveWhatsIncluded(activity, language) {
  const cmsItems = localizedArray(activity, "whatsIncluded", language);
  return {
    items: cmsItems,
    fromCms: cmsItems.length > 0 && Boolean(activity?.whatsIncludedFromCms),
  };
}

export function activityGalleryImages(activity, activityName) {
  const gallery = Array.isArray(activity?.gallery) ? activity.gallery : [];
  return gallery
    .filter((item) => item?.url)
    .map((item, index) => ({
      url: item.url,
      alt:
        item.alt ||
        `${activityName || "Activity"} photo ${index + 1}`,
    }));
}

export function activityStructuredImages(activity, activityName) {
  const images = [];
  if (activity?.image) {
    images.push({
      url: activity.image,
      alt: activityName,
    });
  }

  activityGalleryImages(activity, activityName).forEach((item) => {
    if (!images.some((image) => image.url === item.url)) {
      images.push(item);
    }
  });

  return images;
}
