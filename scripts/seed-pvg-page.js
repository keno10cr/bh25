/**
 * Seed / update the Puerto Viejo Groups page singleton in Sanity.
 *
 * Fills every text field in English plus all locale fields (Es, De, Nl, Fr,
 * Ja, Pt, Ar) from src/data/pvg-i18n.js, the pillars and capacity specs, and
 * uploads the default images from /public. Images already set in Studio are
 * kept.
 *
 * Run: npm run seed:pvg (or node --env-file=.env.local scripts/seed-pvg-page.js)
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import {
  PVG_PAGE_DEFAULTS,
  PVG_PILLARS_DEFAULTS,
  PVG_CAPACITY_SPECS_DEFAULTS,
} from "../src/data/pvg-defaults.js";
import { PVG_I18N } from "../src/data/pvg-i18n.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";

const DOC_ID = "pvgPageSettings";

const LOCALES = [
  { lang: "es", suffix: "Es" },
  { lang: "de", suffix: "De" },
  { lang: "nl", suffix: "Nl" },
  { lang: "fr", suffix: "Fr" },
  { lang: "ja", suffix: "Ja" },
  { lang: "pt", suffix: "Pt" },
  { lang: "ar", suffix: "Ar" },
];

const TEXT_FIELDS = [
  "heroBrandLine",
  "heroHeadline",
  "heroSubtitle",
  "heroCta",
  "guaranteeTitle",
  "guaranteeBody",
  "pillarsTitle",
  "capacityTitle",
  "locationTitle",
  "locationLead",
  "petsTitle",
  "petsNote",
  "petsLinkLabel",
  "locationLegendLabel",
  "activitiesTitle",
  "inquiryTitle",
  "inquiryLead",
  "inquirySubmitLabel",
  "inquirySubmittingLabel",
  "inquirySuccessMessage",
  "organizationLabel",
  "attendeesLabel",
  "attendeeUnit",
  "datesLabel",
  "datesHint",
  "optionLabel",
  "addRangeLabel",
  "contactNameLabel",
  "emailLabel",
  "hostQuote",
  "hostRole",
  "promoEyebrow",
  "promoTitle",
  "promoBody",
  "promoCta",
];

const IMAGES = [
  {
    field: "heroImage",
    file: PVG_PAGE_DEFAULTS.heroImage,
    alt: PVG_PAGE_DEFAULTS.heroImageAlt,
  },
  { field: "guaranteeLogo", file: PVG_PAGE_DEFAULTS.guaranteeLogo },
  {
    field: "hostImage",
    file: PVG_PAGE_DEFAULTS.hostImage,
    alt: PVG_PAGE_DEFAULTS.hostImageAlt,
  },
  {
    field: "promoImage",
    file: PVG_PAGE_DEFAULTS.promoImage,
    alt: PVG_PAGE_DEFAULTS.promoImageAlt,
  },
];

async function getClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (token) {
    return createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      token,
      useCdn: false,
    });
  }
  const { getCliClient } = await import("sanity/cli");
  return getCliClient({ apiVersion: sanityApiVersion });
}

function localizedText() {
  const out = {};
  for (const field of TEXT_FIELDS) {
    out[field] = PVG_I18N.en?.[field] ?? PVG_PAGE_DEFAULTS[field];
    for (const { lang, suffix } of LOCALES) {
      const value = PVG_I18N[lang]?.[field];
      if (value) out[`${field}${suffix}`] = value;
    }
  }
  return out;
}

function localizedItems(defaults, i18nKey, itemType, fields) {
  return defaults.map((item, index) => {
    const out = { _type: itemType, _key: item.id || `${itemType}-${index}` };
    for (const field of fields) {
      out[field] = PVG_I18N.en?.[i18nKey]?.[index]?.[field] || item[field];
      for (const { lang, suffix } of LOCALES) {
        const value = PVG_I18N[lang]?.[i18nKey]?.[index]?.[field];
        if (value) out[`${field}${suffix}`] = value;
      }
    }
    return out;
  });
}

async function uploadImage(client, publicPath) {
  const filePath = path.join(process.cwd(), "public", publicPath);
  const asset = await client.assets.upload(
    "image",
    fs.createReadStream(filePath),
    { filename: path.basename(filePath) }
  );
  return { _type: "reference", _ref: asset._id };
}

async function seed() {
  const client = await getClient();
  const existing = await client.getDocument(DOC_ID);

  const pillars = localizedItems(
    PVG_PILLARS_DEFAULTS,
    "pillars",
    "pvgPillar",
    ["title", "body"]
  ).map((item, index) => {
    const image = existing?.pillars?.[index]?.image;
    return image ? { ...item, image } : item;
  });

  const capacitySpecs = localizedItems(
    PVG_CAPACITY_SPECS_DEFAULTS,
    "capacitySpecs",
    "pvgCapacitySpec",
    ["label", "text"]
  );

  const set = {
    ...localizedText(),
    hostName: PVG_PAGE_DEFAULTS.hostName,
    locationLat: PVG_PAGE_DEFAULTS.locationLat,
    locationLng: PVG_PAGE_DEFAULTS.locationLng,
    pillars,
    capacitySpecs,
  };

  for (const image of IMAGES) {
    if (existing?.[image.field]?.asset?._ref) {
      console.log(`Keeping existing ${image.field}`);
      continue;
    }
    console.log(`Uploading ${image.file} to ${image.field}`);
    const asset = await uploadImage(client, image.file);
    set[image.field] = {
      _type: "image",
      asset,
      ...(image.alt ? { alt: image.alt } : {}),
    };
  }

  await client.createIfNotExists({ _id: DOC_ID, _type: "pvgPageSettings" });
  await client.patch(DOC_ID).set(set).commit();

  console.log(
    `Seeded ${DOC_ID}: ${TEXT_FIELDS.length} fields in 8 languages, ${pillars.length} pillars, ${capacitySpecs.length} specs.`
  );
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
