import { createClient } from "@sanity/client";
import { STATIC_ACTIVITIES } from "../src/data/activities.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";
import {
  LEGEND_ITEMS,
  legendDocument,
  legendRefsForCategory,
} from "./legend-items.js";

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

async function patch() {
  const client = await getClient();
  const transaction = client.transaction();

  LEGEND_ITEMS.forEach((item) => {
    transaction.createOrReplace(legendDocument(item));
  });

  const activities = await client.fetch(
    `*[_type == "activity"]{ _id, title, category, "slug": slug.current, legendItems }`
  );

  const staticBySlug = new Map(
    STATIC_ACTIVITIES.map((activity) => [activity.slug, activity])
  );

  for (const activity of activities) {
    if (Array.isArray(activity.legendItems) && activity.legendItems.length > 0) {
      continue;
    }
    const fallback = staticBySlug.get(activity.slug);
    const category = activity.category || fallback?.category || "Blessed House";
    transaction.patch(activity._id, {
      set: { legendItems: legendRefsForCategory(category) },
    });
    console.log(`Patched legend for ${activity.title || activity._id}`);
  }

  console.log("Committing legend items...");
  await transaction.commit({ autoGenerateArrayKeys: true });
  console.log("Legend items ready.");
}

patch().catch((error) => {
  console.error(error);
  process.exit(1);
});
