/**
 * Shared locale + field maps for Sanity translation export/import.
 * English is the source field (no suffix). Locales use Es/De/Nl/Fr/Ja/Pt.
 */

import { whatsIncludedLabels } from "./whats-included.js";

export const LOCALES = [
  { code: "es", suffix: "Es", title: "Spanish" },
  { code: "de", suffix: "De", title: "German" },
  { code: "nl", suffix: "Nl", title: "Dutch" },
  { code: "fr", suffix: "Fr", title: "French" },
  { code: "ja", suffix: "Ja", title: "Japanese" },
  { code: "pt", suffix: "Pt", title: "Portuguese" },
];

/** Top-level localizable fields per document type. */
export const DOCUMENT_FIELDS = {
  villa: [
    { name: "name", kind: "string" },
    { name: "description", kind: "blocks" },
  ],
  activity: [
    { name: "title", kind: "string" },
    { name: "duration", kind: "string" },
    { name: "groupSize", kind: "string" },
    { name: "description", kind: "blocks" },
    { name: "whatsIncluded", kind: "stringArray" },
  ],
  blog: [
    { name: "title", kind: "string" },
    { name: "excerpt", kind: "string" },
    { name: "content", kind: "blocks" },
  ],
  legendItem: [{ name: "title", kind: "string" }],
  review: [{ name: "comment", kind: "string" }],
  homePageSettings: [
    { name: "heroTitle", kind: "string" },
    { name: "heroSubtitle", kind: "string" },
    { name: "heroCtaPrimary", kind: "string" },
    { name: "heroCtaSecondary", kind: "string" },
    { name: "featuredTitle", kind: "string" },
    { name: "featuredSubtitle", kind: "string" },
    { name: "featuredLearnMore", kind: "string" },
    { name: "featuredCta", kind: "string" },
    { name: "locationTitle", kind: "string" },
    { name: "locationDescription", kind: "string" },
    { name: "locationMapsInfo", kind: "string" },
    { name: "locationMapsQuery", kind: "string" },
    { name: "locationCta", kind: "string" },
    { name: "activitiesTitle", kind: "string" },
    { name: "activitiesSubtitle", kind: "string" },
    { name: "activitiesCta", kind: "string" },
    { name: "reviewsTitle", kind: "string" },
    { name: "reviewsSubtitle", kind: "string" },
  ],
  aboutPageSettings: [
    { name: "welcomeTitle", kind: "string" },
    { name: "welcomeDescription", kind: "string" },
    { name: "welcomeVideoBy", kind: "string" },
    { name: "ourPlaceTitle", kind: "string" },
    { name: "ourPlaceDescription", kind: "string" },
    { name: "ourPlaceCta", kind: "string" },
  ],
  contactPageSettings: [
    { name: "title", kind: "string" },
    { name: "subtitle", kind: "string" },
    { name: "formTitle", kind: "string" },
    { name: "infoTitle", kind: "string" },
  ],
  galleryPageSettings: [
    { name: "title", kind: "string" },
    { name: "description", kind: "string" },
  ],
  activitiesPageSettings: [
    { name: "title", kind: "string" },
    { name: "subtitle", kind: "string" },
  ],
  blogPageSettings: [
    { name: "title", kind: "string" },
    { name: "subtitle", kind: "string" },
  ],
  villasPageSettings: [
    { name: "title", kind: "string" },
    { name: "subtitle", kind: "string" },
  ],
  systemSettings: [{ name: "taxLabelEn", kind: "string" }],
};

/** Nested array objects that also have Translations companions. */
export const ARRAY_FIELDS = {
  systemSettings: [
    {
      name: "checkoutFeeCatalog",
      fields: [{ name: "title", kind: "string" }],
      meta: ["feeId", "feeType", "amount", "application"],
    },
  ],
  homePageSettings: [
    {
      name: "featuredItems",
      fields: [
        { name: "name", kind: "string" },
        { name: "teaser", kind: "string" },
      ],
      meta: ["slug"],
    },
    {
      name: "thingsToDoItems",
      fields: [
        { name: "title", kind: "string" },
        { name: "description", kind: "string" },
      ],
      meta: [],
    },
  ],
};

export const EXPORTABLE_TYPES = Object.keys(DOCUMENT_FIELDS);

export function blocksToText(blocks) {
  if (!Array.isArray(blocks)) return typeof blocks === "string" ? blocks : "";
  return blocks
    .map((block) => {
      if (block._type !== "block" || !Array.isArray(block.children)) return "";
      return block.children.map((child) => child.text || "").join("");
    })
    .filter(Boolean)
    .join("\n\n");
}

export function textToBlocks(text, prefix) {
  return String(text || "")
    .split(/\n\n+/)
    .filter(Boolean)
    .map((paragraph, index) => ({
      _type: "block",
      _key: `${prefix}-${index}`,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `${prefix}-s${index}`,
          text: paragraph,
          marks: [],
        },
      ],
    }));
}

export function emptyLocaleBag() {
  const bag = { en: "" };
  for (const locale of LOCALES) bag[locale.code] = "";
  return bag;
}

export function readLocalizedValue(doc, fieldName, kind) {
  const bag = emptyLocaleBag();
  const rawEn = doc?.[fieldName];
  if (kind === "stringArray") {
    bag.en = whatsIncludedLabels(rawEn);
    for (const locale of LOCALES) {
      const raw = doc?.[`${fieldName}${locale.suffix}`];
      bag[locale.code] = whatsIncludedLabels(raw);
    }
    return bag;
  }
  bag.en = kind === "blocks" ? blocksToText(rawEn) : rawEn || "";
  for (const locale of LOCALES) {
    const raw = doc?.[`${fieldName}${locale.suffix}`];
    bag[locale.code] = kind === "blocks" ? blocksToText(raw) : raw || "";
  }
  return bag;
}
