/**
 * Create the Punta Mona activity in Sanity if it does not already exist.
 *
 * Run: npm run create:punta-mona
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "next-sanity";
import { translations } from "../src/lib/translations.js";
import { legendRefsForCategory } from "./legend-items.js";
import { toWhatsIncludedItems } from "./whats-included.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";

const ACTIVITY_ID = "activity-punta-mona";
const SLUG = "punta-mona";
const IMAGE_PATH = "activities/all/manzanilloHike.jpg";

function toBlocks(text, prefix) {
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

async function uploadImage(client, relativePath) {
  const filePath = path.join(process.cwd(), "public", relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping missing image: ${relativePath}`);
    return undefined;
  }

  const buffer = fs.readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(filePath),
  });

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "Rainforest trail toward Punta Mona near Manzanillo, Costa Rica",
  };
}

async function createPuntaMona() {
  const client = await getClient();
  const existing = await client.fetch(
    `*[_type == "activity" && (slug.current == $slug || _id == $id)][0]{_id, title}`,
    { slug: SLUG, id: ACTIVITY_ID }
  );

  if (existing?._id) {
    console.log(`Punta Mona already exists as ${existing._id}.`);
    return;
  }

  const copy = translations.en.activitiesPage.puntaMona;
  const image = await uploadImage(client, IMAGE_PATH);

  await client.create({
    _id: ACTIVITY_ID,
    _type: "activity",
    title: copy.name,
    slug: { _type: "slug", current: SLUG },
    category: "Beaches",
    legendItems: legendRefsForCategory("Beaches"),
    difficulty: "Moderate",
    duration: "Half day to Full day",
    groupSize: "Up to 8 people",
    coordinates: {
      _type: "geopoint",
      lat: 9.631013,
      lng: -82.619816,
    },
    image,
    description: toBlocks(
      [copy.description, copy.fullDescription].filter(Boolean).join("\n\n"),
      SLUG
    ),
    whatsIncluded: toWhatsIncludedItems(copy.highlights, SLUG),
  });

  console.log("Created activity Punta Mona (activity-punta-mona).");
}

createPuntaMona().catch((error) => {
  console.error(error);
  process.exit(1);
});
