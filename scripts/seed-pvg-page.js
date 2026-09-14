/**
 * Seed / update the Puerto Viejo Groups page singleton in Sanity (text fields only).
 * Images can be uploaded in Studio.
 *
 * Run: sanity exec scripts/seed-pvg-page.js --with-user-token
 */
import { createClient } from "next-sanity";
import {
  PVG_PAGE_DEFAULTS,
  PVG_PILLARS_DEFAULTS,
  PVG_CAPACITY_SPECS_DEFAULTS,
} from "../src/data/pvg-defaults.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";

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

async function seed() {
  const client = await getClient();

  const {
    heroImage: _heroImage,
    heroImageAlt: _heroImageAlt,
    guaranteeLogo: _guaranteeLogo,
    capacityImage: _capacityImage,
    capacityImageAlt: _capacityImageAlt,
    ...copy
  } = PVG_PAGE_DEFAULTS;

  await client.createOrReplace({
    _id: "pvgPageSettings",
    _type: "pvgPageSettings",
    ...copy,
    pillars: PVG_PILLARS_DEFAULTS.map((item, index) => ({
      _type: "pvgPillar",
      _key: item.id || `pillar-${index}`,
      title: item.title,
      body: item.body,
    })),
    capacitySpecs: PVG_CAPACITY_SPECS_DEFAULTS.map((item, index) => ({
      _type: "pvgCapacitySpec",
      _key: item.id || `spec-${index}`,
      label: item.label,
      text: item.text,
    })),
  });

  console.log("Seeded pvgPageSettings (text + arrays). Upload images in Studio.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
