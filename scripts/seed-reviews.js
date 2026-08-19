import { createClient } from "@sanity/client";
import { STATIC_REVIEWS } from "../src/data/reviews.js";
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
  const existing = await client.fetch(`*[_type == "review"]._id`);
  const transaction = client.transaction();

  for (const id of existing) {
    transaction.delete(id);
  }

  for (const review of STATIC_REVIEWS) {
    transaction.create({
      _id: `review-${review.id}`,
      _type: "review",
      guestName: review.guestName,
      date: `${review.date}T16:00:00.000Z`,
      rating: review.rating,
      comment: review.comment,
    });
  }

  const home = await client.getDocument("homePageSettings");
  if (home?._id) {
    transaction.patch("homePageSettings", {
      set: {
        reviewsSubtitle: "Seven years of stays in the southern Caribbean",
      },
    });
  }

  console.log(`Replacing ${existing.length} reviews with ${STATIC_REVIEWS.length}...`);
  await transaction.commit();
  console.log("Seeded reviews for 2020 through 2026.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
