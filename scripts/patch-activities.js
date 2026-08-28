/**
 * Sync activity coordinates, copy, images, and what's included from
 * STATIC_ACTIVITIES into Sanity. Also patches any CMS only activities
 * that match a translation key by slug.
 *
 * Run: npm run patch:activities
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "next-sanity";
import { STATIC_ACTIVITIES } from "../src/data/activities.js";
import { translations } from "../src/lib/translations.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";
import { legendRefsForCategory } from "./legend-items.js";
import {
  deleteActivityDrafts,
  normalizeAllActivityWhatsIncluded,
  reconcileActivityDrafts,
} from "./sanity-document-sync.js";
import { toWhatsIncludedItems } from "./whats-included.js";

const en = translations.en;
const imageCache = new Map();

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

function publicPath(relative) {
  return path.join(
    process.cwd(),
    "public",
    String(relative || "").replace(/^\//, "")
  );
}

function translationKeyForSlug(slug) {
  const staticActivity = STATIC_ACTIVITIES.find((item) => item.slug === slug);
  return staticActivity?.translationKey || null;
}

function highlightsForSlug(slug) {
  const key = translationKeyForSlug(slug);
  const highlights = key ? en.activitiesPage?.[key]?.highlights : null;
  return Array.isArray(highlights) ? highlights.filter(Boolean) : [];
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
  if (!relativePath) return undefined;
  if (imageCache.has(relativePath)) return imageCache.get(relativePath);

  const filePath = publicPath(relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping missing image: ${relativePath}`);
    imageCache.set(relativePath, undefined);
    return undefined;
  }

  const buffer = fs.readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(filePath),
  });
  const image = {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
  imageCache.set(relativePath, image);
  return image;
}

async function patchActivities() {
  const client = await getClient();
  const transaction = client.transaction();

  for (const activity of STATIC_ACTIVITIES) {
    const copy = en.activitiesPage[activity.translationKey] || {};
    const image = await uploadImage(client, activity.image);
    const difficulty =
      activity.difficulty && activity.difficulty !== "N/A"
        ? activity.difficulty
        : undefined;

    transaction.createOrReplace({
      _id: `activity-${activity.slug}`,
      _type: "activity",
      title: copy.name || activity.slug,
      slug: { _type: "slug", current: activity.slug },
      category: activity.category,
      legendItems: legendRefsForCategory(activity.category),
      difficulty,
      duration: activity.duration,
      groupSize: activity.groupSize,
      coordinates: activity.coordinates
        ? {
            _type: "geopoint",
            lat: activity.coordinates.lat,
            lng: activity.coordinates.lng,
          }
        : undefined,
      image,
      description: toBlocks(
        [copy.description, copy.fullDescription].filter(Boolean).join("\n\n"),
        activity.slug
      ),
      whatsIncluded: toWhatsIncludedItems(copy.highlights, activity.slug),
    });
    console.log(`Queued ${copy.name || activity.slug}`);
  }

  console.log("Committing activities...");
  await transaction.commit({ autoGenerateArrayKeys: true });

  const cmsOnlyActivities = await client.fetch(
    `*[_type == "activity" && !(_id in path("drafts.**")) && !(_id in $staticIds)]{ _id, "slug": slug.current }`,
    { staticIds: STATIC_ACTIVITIES.map((item) => `activity-${item.slug}`) }
  );

  if (Array.isArray(cmsOnlyActivities) && cmsOnlyActivities.length > 0) {
    const orphanTx = client.transaction();
    for (const activity of cmsOnlyActivities) {
      const highlights = highlightsForSlug(activity.slug);
      if (!highlights.length) continue;
      orphanTx.patch(activity._id, {
        set: {
          whatsIncluded: toWhatsIncludedItems(highlights, activity.slug),
        },
      });
      console.log(`Queued CMS only activity ${activity.slug}`);
    }
    await orphanTx.commit();
  }

  const normalized = await normalizeAllActivityWhatsIncluded(client);
  console.log(`Normalized what's included on ${normalized} activities.`);

  const syncedDrafts = await reconcileActivityDrafts(client);
  if (syncedDrafts > 0) {
    console.log(`Synced what's included on ${syncedDrafts} activity draft(s).`);
  }

  const removedDrafts = await deleteActivityDrafts(client);
  if (removedDrafts > 0) {
    console.log(`Removed ${removedDrafts} stale activity draft(s).`);
  }

  console.log(`Synced ${STATIC_ACTIVITIES.length} activities to Sanity.`);
}

patchActivities().catch((error) => {
  console.error(error);
  process.exit(1);
});
