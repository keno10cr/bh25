import { CAPTION_LOCALE_FIELDS } from "./caption-locales.js";
import { translateText } from "./google-translate.js";

const LOCALE_LIST = Object.entries(CAPTION_LOCALE_FIELDS).map(([id, field]) => ({
  id,
  field,
}));

const PATCH_FIELDS = new Set([
  "caption",
  "alt",
  "captionTranslatedFrom",
  ...Object.values(CAPTION_LOCALE_FIELDS),
]);

const GALLERY_KEY = /^[A-Za-z0-9_-]{1,80}$/;

function seedCaption(seed, slug, filename) {
  const group = seed?.[slug];
  if (!group || !filename) return "";
  const wanted = String(filename).toLowerCase();
  const key = Object.keys(group).find((name) => name.toLowerCase() === wanted);
  return key ? String(group[key] || "").trim() : "";
}

function patchPath(key, field) {
  return `gallery[_key=="${key}"].${field}`;
}

function slugOf(doc) {
  const slug = doc?.slug;
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return String(slug.current || "");
}

/**
 * True when this English line has never been translated, a locale is empty,
 * or the English line changed since the last translation.
 */
export function captionNeedsTranslation(image, english) {
  const source = String(english || "").trim();
  if (!source) return false;
  if (String(image?.captionTranslatedFrom || "").trim() !== source) return true;
  return LOCALE_LIST.some((locale) => !String(image?.[locale.field] || "").trim());
}

/**
 * Keep only gallery caption paths. Drops anything else a response might contain.
 */
export function captionPatchSet(set) {
  const next = {};
  for (const [path, value] of Object.entries(set || {})) {
    const match = String(path).match(
      /^gallery\[_key=="([A-Za-z0-9_-]{1,80})"\]\.([A-Za-z0-9]+)$/
    );
    if (!match || !PATCH_FIELDS.has(match[2])) continue;
    if (typeof value !== "string") continue;
    next[path] = value;
  }
  return next;
}

/**
 * Build the Sanity patch for one property. Does not write.
 * `seed` is only used by the CLI `--seed` path.
 */
export async function buildCaptionPatch(doc, seed = {}) {
  const set = {};
  let captionsWritten = 0;
  let translated = 0;
  let skipped = 0;
  let examined = 0;
  const slug = slugOf(doc);
  const images = Array.isArray(doc?.gallery) ? doc.gallery : [];

  for (const image of images) {
    if (!image?._key || !GALLERY_KEY.test(String(image._key))) continue;
    const current = String(image.caption || "").trim();
    const seeded = seedCaption(seed, slug, image.filename);
    const english = current || seeded;
    if (!english) continue;
    examined += 1;

    if (!current && seeded) {
      set[patchPath(image._key, "caption")] = seeded;
      set[patchPath(image._key, "alt")] = seeded;
      captionsWritten += 1;
    }

    if (!captionNeedsTranslation(image, english)) {
      skipped += 1;
      continue;
    }

    for (const locale of LOCALE_LIST) {
      const value = await translateText(english, locale.id);
      if (!value) continue;
      set[patchPath(image._key, locale.field)] = value;
    }
    set[patchPath(image._key, "captionTranslatedFrom")] = english;
    translated += 1;
    if (typeof window === "undefined") {
      console.log(`${slug || "property"} · ${image.filename || image._key}`);
    }
  }

  return {
    set: captionPatchSet(set),
    captionsWritten,
    translated,
    skipped,
    examined,
  };
}

/**
 * The Studio button sends the open property's captions here.
 * Only known caption fields are kept.
 */
export function galleryFromRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid request");
  }
  const gallery = body.gallery;
  if (!Array.isArray(gallery) || gallery.length > 40) {
    throw new Error("Invalid gallery");
  }
  const slug = String(body.slug || "").trim().slice(0, 120);
  const images = gallery.map((image) => {
    if (!image || typeof image !== "object" || !GALLERY_KEY.test(String(image._key || ""))) {
      throw new Error("Invalid photo");
    }
    const next = { _key: String(image._key) };
    if (typeof image.filename === "string" && image.filename.length <= 180) {
      next.filename = image.filename;
    }
    for (const field of PATCH_FIELDS) {
      if (field === "alt") continue;
      const value = image[field];
      if (value == null || value === "") {
        next[field] = "";
        continue;
      }
      if (typeof value !== "string" || value.trim().length > 600) {
        throw new Error("Invalid caption");
      }
      next[field] = value.trim();
    }
    return next;
  });
  return { _id: "request", slug, gallery: images };
}

/**
 * Fill empty English captions from `seed`, then translate every English
 * caption whose text changed into the other seven site languages.
 * Shared photos with no English caption are left alone so the site can
 * keep its existing translated labels.
 *
 * With no `ids`, only published properties are updated.
 * Pass `sourceDocument` to translate the open Studio document, draft included.
 */
export async function syncPropertyCaptions(client, { seed = {}, ids = null, sourceDocument = null } = {}) {
  let docs = [];
  if (sourceDocument) {
    docs = [sourceDocument];
  } else {
    const filter = ids?.length
      ? `_type == "property" && _id in $ids`
      : `_type == "property" && !(_id in path("drafts.**"))`;
    const fetched = await client.fetch(
      `*[${filter}]{
        _id,
        "slug": slug.current,
        gallery[]{
          _key,
          alt,
          caption,
          captionEs,
          captionDe,
          captionNl,
          captionFr,
          captionJa,
          captionPt,
          captionAr,
          captionTranslatedFrom,
          "filename": asset->originalFilename
        }
      }`,
      { ids: ids || [] },
      ids?.length ? { perspective: "raw" } : undefined
    );
    docs = Array.isArray(fetched) ? fetched : [];
  }

  let captionsWritten = 0;
  let translated = 0;
  let skipped = 0;
  let examined = 0;
  const documents = [];

  for (const doc of docs) {
    if (!doc?._id) continue;
    const patch = await buildCaptionPatch(doc, seed);
    captionsWritten += patch.captionsWritten;
    translated += patch.translated;
    skipped += patch.skipped;
    examined += patch.examined;
    if (Object.keys(patch.set).length) {
      await client.patch(doc._id).set(patch.set).commit();
      documents.push(doc._id);
    }
  }

  return {
    documents: documents.length,
    captionsWritten,
    translated,
    skipped,
    examined,
    found: docs.length,
  };
}
