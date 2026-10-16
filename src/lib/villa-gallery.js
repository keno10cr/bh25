import { CAPTION_LOCALE_FIELDS } from "./caption-locales.js";

export const PROPERTY_MAP_SRC = "/villas/general/map.jpg";

export const SHARED_VILLA_IMAGES = [
  "/villas/general/charger.jpg",
  "/villas/general/junglepool.jpg",
  PROPERTY_MAP_SRC,
  "/villas/general/pool.jpg",
];

const SHARED_MARKERS = {
  charger: {
    src: "/villas/general/charger.jpg",
    keywords: ["charger"],
    dims: ["842x1496"],
    assets: ["3e7e7e2e337eb3c7c13b14eebe336bb23456ad56"],
  },
  junglepool: {
    src: "/villas/general/junglepool.jpg",
    keywords: ["junglepool"],
    dims: [],
    assets: ["980727870bede29be488d69b69bd21a19c841b4a"],
  },
  map: {
    src: PROPERTY_MAP_SRC,
    keywords: ["general/map", "map.jpg", "bhmap.jpg"],
    dims: ["1500x931"],
    assets: ["64cff6fcf9e577c6fdceddb7d2eb785ed7ba2ea3"],
  },
  pool: {
    src: "/villas/general/pool.jpg",
    keywords: ["general/pool"],
    dims: ["1500x1053"],
    assets: ["cb13623d32fb3a49d17d02374496498a59b9b28f"],
  },
};

function fileKey(src) {
  return String(src || "")
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .pop()
    .toLowerCase();
}

function sanityDimensions(src) {
  const match = String(src || "").match(/-(\d{3,5}x\d{3,5})\.(?:jpe?g|png|webp)/i);
  return match ? match[1].toLowerCase() : "";
}

function sanityAssetId(src) {
  const match = String(src || "").match(/\/([a-f0-9]{32,})-/i);
  return match ? match[1].toLowerCase() : "";
}

export function sharedImageKind(src) {
  const path = String(src || "").split("?")[0].toLowerCase();
  const file = fileKey(path);
  const dims = sanityDimensions(path);
  const asset = sanityAssetId(path);

  return (
    Object.keys(SHARED_MARKERS).find((kind) => {
      const meta = SHARED_MARKERS[kind];
      if (meta.keywords.some((keyword) => path.includes(keyword) || file === keyword)) {
        return true;
      }
      if (dims && meta.dims.includes(dims)) return true;
      if (asset && meta.assets.includes(asset)) return true;
      return false;
    }) || null
  );
}

export function isPropertyMapSrc(src) {
  return sharedImageKind(src) === "map";
}

const SHARED_FILENAMES = {
  "charger.jpg": "charger",
  "junglepool.jpg": "junglepool",
  "map.jpg": "map",
  "pool.jpg": "pool",
};

function galleryHasSharedKind(urls, kind) {
  if (urls.some((src) => imageKind(src) === kind)) return true;
  if (kind !== "junglepool") return false;
  return ["charger", "map", "pool"].every((other) =>
    urls.some((src) => imageKind(src) === other)
  );
}

export function galleryImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.url || image.src || "";
}

export function galleryImageFilename(image) {
  if (!image) return "";
  if (typeof image === "string") return fileKey(image);
  const named = image.filename || image.originalFilename || "";
  if (named) return fileKey(named);
  return fileKey(image.url || "");
}

function imageKind(src, filename = "") {
  return (
    sharedImageKind(src) ||
    sharedImageKind(filename) ||
    SHARED_FILENAMES[fileKey(filename)] ||
    SHARED_FILENAMES[fileKey(src)] ||
    null
  );
}

export function cmsGalleryItems(villa, property = null) {
  const fromProperty = Array.isArray(property?.gallery) ? property.gallery : [];
  const fromVilla = Array.isArray(villa?.cmsGallery) ? villa.cmsGallery : [];
  const source = fromProperty.length ? fromProperty : fromVilla;
  return source
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") return { url: item };
      if (!item.url) return null;
      return item;
    })
    .filter(Boolean);
}

function filenameForSrc(src, villa) {
  const files = Array.isArray(villa?.galleryFiles) ? villa.galleryFiles : [];
  const hit = files.find((item) => item?.url === src);
  if (hit?.filename) return fileKey(hit.filename);
  return fileKey(src);
}

export function mergeVillaGallery(villa, property = null) {
  const seen = new Set();
  const out = [];

  const add = (src, filename = "") => {
    if (!src) return;
    const kind = imageKind(src, filename);
    const name = fileKey(filename);
    const key = kind || name || fileKey(src);
    if (!key || seen.has(key)) return;
    if (kind && seen.has(kind)) return;
    if (name && seen.has(name)) return;
    seen.add(key);
    if (kind) seen.add(kind);
    if (name) seen.add(name);
    out.push(src);
  };

  const cms = cmsGalleryItems(villa, property);
  const villaGallery = (villa?.galleryImages || villa?.gallery || [])
    .map(galleryImageUrl)
    .filter(Boolean);

  if (cms.length) {
    cms.forEach((item) => add(item.url, galleryImageFilename(item)));
    villaGallery.forEach((src) => add(src, filenameForSrc(src, villa)));
  } else {
    villaGallery.forEach((src) => add(src));
    if (out.length < 3) {
      (property?.gallery || []).forEach((item) =>
        add(galleryImageUrl(item), galleryImageFilename(item))
      );
      add(property?.heroImage);
      add(villa?.image);
    }
  }

  SHARED_VILLA_IMAGES.forEach((src) => {
    const kind = sharedImageKind(src);
    if (kind && (seen.has(kind) || galleryHasSharedKind(out, kind))) return;
    add(src);
  });

  return out;
}

function customCaption(src, villa, property, language) {
  const images = cmsGalleryItems(villa, property);
  if (!images.length) return "";
  const direct = images.find((item) => item.url === src);
  const filename = direct
    ? galleryImageFilename(direct)
    : filenameForSrc(src, villa);
  const image =
    direct ||
    images.find((item) => galleryImageFilename(item) && galleryImageFilename(item) === filename);
  if (!image) return "";
  const lang = String(language || "en").toLowerCase();
  if (lang !== "en") {
    const field = CAPTION_LOCALE_FIELDS[lang];
    const local = field ? String(image[field] || "").trim() : "";
    if (local) return local;
  }
  return String(image.caption || "").trim();
}

export function villaImageCaption(src, villa, t, language = "en", property = null) {
  const custom = customCaption(src, villa, property, language);
  if (custom) return custom;
  const kind = imageKind(src, filenameForSrc(src, villa));
  if (kind === "charger") return t("villas.gallery.charger");
  if (kind === "junglepool") return t("villas.gallery.junglePool");
  if (kind === "map") return t("villas.gallery.propertyMap");
  if (kind === "pool") return t("villas.gallery.sharedPool");
  return t("villas.gallery.villaPhoto").replace("{name}", villa?.name || "Villa");
}
