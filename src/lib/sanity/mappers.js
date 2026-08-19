import { cmsField } from "@/lib/cms-field";

const LEGEND_COLORS = {
  Beaches: "#2e86ab",
  "Blessed House": "#0a4c3a",
  Waterfalls: "#3d8b6e",
  Tours: "#e8a838",
};

export function portableTextToPlain(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";

  return value
    .map((block) => {
      if (block._type !== "block" || !Array.isArray(block.children)) return "";
      return block.children.map((child) => child.text || "").join("");
    })
    .filter(Boolean)
    .join("\n\n");
}

export function mapActivity(raw, fallback = null) {
  if (!raw && !fallback) return null;
  const base = fallback || {};
  const coordinates = raw?.coordinates
    ? { lat: raw.coordinates.lat, lng: raw.coordinates.lng }
    : base.coordinates || null;

  const legendItems = Array.isArray(raw?.legendItems)
    ? raw.legendItems.filter(Boolean)
    : [];
  const fallbackCategory =
    raw?.category || base.category || "Blessed House";
  const mappedLegend =
    legendItems.length > 0
      ? legendItems
      : [
          {
            title: fallbackCategory,
            slug: String(fallbackCategory).toLowerCase().replace(/\s+/g, "-"),
            color: LEGEND_COLORS[fallbackCategory] || "#0a4c3a",
          },
        ];
  const primaryLegend = mappedLegend[0] || null;

  return {
    ...base,
    id: raw?._id || base.id,
    slug: raw?.slug || base.slug,
    name: raw?.title || base.name,
    title: raw?.title || base.title || base.name,
    category: primaryLegend?.title || fallbackCategory,
    legendItems: mappedLegend,
    pinColor:
      primaryLegend?.color || LEGEND_COLORS[fallbackCategory] || "#0a4c3a",
    difficulty: raw?.difficulty || base.difficulty || "N/A",
    duration: raw?.duration || base.duration,
    groupSize: raw?.groupSize || base.groupSize,
    coordinates,
    image: raw?.image || base.image,
    description: raw?.description
      ? portableTextToPlain(raw.description)
      : base.description,
    descriptionBlocks: raw?.description || null,
    fullDescription: raw?.description
      ? portableTextToPlain(raw.description)
      : base.fullDescription,
    fromCms: Boolean(raw?._id),
    nameFromCms: Boolean(raw?.title),
    descriptionFromCms: Boolean(raw?.description),
  };
}

export function mapVilla(raw, fallback = null) {
  if (!raw && !fallback) return null;
  const base = fallback || {};
  const gallery = Array.isArray(raw?.gallery)
    ? raw.gallery.filter(Boolean)
    : base.galleryImages || base.gallery || [];

  return {
    ...base,
    id: raw?._id || base.id,
    name: raw?.name || base.name,
    slug: raw?.slug || base.slug,
    maxPeople: raw?.capacity ?? base.maxPeople ?? base.capacity,
    capacity: raw?.capacity ?? base.capacity ?? base.maxPeople,
    bedrooms: raw?.bedrooms ?? base.bedrooms,
    bathrooms: raw?.bathrooms ?? base.bathrooms,
    amenities: raw?.amenities?.length ? raw.amenities : base.amenities,
    gallery,
    galleryImages: gallery.length ? gallery : base.galleryImages,
    image: gallery[0] || base.image,
    description: raw?.description
      ? portableTextToPlain(raw.description)
      : base.description,
    descriptionBlocks: raw?.description || null,
    bookingUrl: raw?.bookingUrl || base.bookingUrl,
    fromCms: Boolean(raw?._id),
    nameFromCms: Boolean(raw?.name),
    descriptionFromCms: Boolean(raw?.description),
  };
}

export function mapReview(raw) {
  if (!raw) return null;
  return {
    id: raw._id,
    guestName: raw.guestName,
    date: raw.date,
    rating: Number(raw.rating) || 5,
    comment: raw.comment,
    villaName: raw.villaName || null,
    villaSlug: raw.villaSlug || null,
    fromCms: true,
  };
}

export function mapBlogPost(raw, fallback = null) {
  if (!raw && !fallback) return null;
  const base = fallback || {};
  return {
    id: raw?._id || base.id,
    title: raw?.title || base.title,
    slug: raw?.slug || base.slug,
    category: raw?.category || base.category,
    publishedAt: raw?.publishedAt || base.publishedAt,
    excerpt: raw?.excerpt || base.excerpt || "",
    featuredImage: raw?.featuredImage || base.featuredImage || null,
    content: raw?.content || base.content || [],
    fromCms: Boolean(raw?._id),
    titleFromCms: Boolean(raw?.title),
    excerptFromCms: Boolean(raw?.excerpt),
  };
}

export function mapPageSettings(raw, defaults) {
  const mapped = {};
  Object.keys(defaults).forEach((key) => {
    mapped[key] = cmsField(raw?.[key], defaults[key]);
  });
  mapped.fromCms = Boolean(raw?._id);
  return mapped;
}

export function mapFeaturedItems(rawItems, fallbackItems) {
  if (Array.isArray(rawItems) && rawItems.length > 0) {
    return rawItems.map((item, index) => {
      const fallback = fallbackItems[index] || {};
      return {
        slug: item.slug || fallback.slug,
        name: item.name || fallback.name,
        teaser: item.teaser || fallback.teaser,
        image: item.image || fallback.image,
        fromCms: true,
        nameFromCms: Boolean(item.name),
        teaserFromCms: Boolean(item.teaser),
      };
    });
  }

  return fallbackItems.map((item) => ({
    ...item,
    fromCms: false,
    nameFromCms: false,
    teaserFromCms: false,
  }));
}

export function mapThingsToDoItems(rawItems, fallbackItems) {
  if (Array.isArray(rawItems) && rawItems.length > 0) {
    return rawItems.map((item, index) => {
      const fallback = fallbackItems[index] || {};
      return {
        id: item._key || fallback.id || index,
        title: item.title || fallback.title,
        description: item.description || fallback.description,
        image: item.image || fallback.image,
        fromCms: true,
        titleFromCms: Boolean(item.title),
        descriptionFromCms: Boolean(item.description),
      };
    });
  }

  return fallbackItems.map((item) => ({
    ...item,
    fromCms: false,
    titleFromCms: false,
    descriptionFromCms: false,
  }));
}
