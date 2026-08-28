import { localizedArray } from "@/lib/localized";

export function resolveWhatsIncluded(activity, language, t) {
  const cmsItems = localizedArray(activity, "whatsIncluded", language);
  if (cmsItems.length > 0) {
    return {
      items: cmsItems,
      fromCms: Boolean(activity.whatsIncludedFromCms),
    };
  }

  const key = activity?.translationKey;
  const translated = key ? t(`activitiesPage.${key}.highlights`) : null;
  if (Array.isArray(translated) && translated.length > 0) {
    return { items: translated, fromCms: false };
  }

  return { items: [], fromCms: false };
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
