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

function galleryHasSharedKind(urls, kind) {
  if (urls.some((src) => sharedImageKind(src) === kind)) return true;
  if (kind !== "junglepool") return false;
  return ["charger", "map", "pool"].every((other) =>
    urls.some((src) => sharedImageKind(src) === other)
  );
}

export function mergeVillaGallery(villa, property = null) {
  const seen = new Set();
  const out = [];

  const add = (src) => {
    if (!src) return;
    const kind = sharedImageKind(src);
    const key = kind || fileKey(src);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(src);
  };

  const villaGallery = (villa?.galleryImages || villa?.gallery || []).filter(Boolean);
  villaGallery.forEach(add);

  if (out.length < 3) {
    (property?.gallery || []).forEach(add);
    add(property?.heroImage);
    add(villa?.image);
  }

  SHARED_VILLA_IMAGES.forEach((src) => {
    const kind = sharedImageKind(src);
    if (kind && galleryHasSharedKind(out, kind)) return;
    add(src);
  });

  return out;
}

export function villaImageCaption(src, villa, t) {
  const kind = sharedImageKind(src);
  if (kind === "charger") return t("villas.gallery.charger");
  if (kind === "junglepool") return t("villas.gallery.junglePool");
  if (kind === "map") return t("villas.gallery.propertyMap");
  if (kind === "pool") return t("villas.gallery.sharedPool");
  return t("villas.gallery.villaPhoto").replace("{name}", villa?.name || "Villa");
}
