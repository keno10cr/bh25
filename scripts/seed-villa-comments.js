/**
 * Seeds published villa comment form submissions (3 to 7 per villa).
 * These appear on villa detail pages, separate from home page reviews.
 *
 * Run: npm run seed:villa-comments
 */
import { createClient } from "next-sanity";
import { STATIC_VILLAS } from "../src/data/villas.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";
import { pickVillaComments } from "./villa-comments-data.js";

async function getClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error("SANITY_API_WRITE_TOKEN is missing from .env.local");
  }
  return createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    token,
    useCdn: false,
  });
}

async function seed() {
  const client = await getClient();
  const transaction = client.transaction();

  const existing = await client.fetch(
    `*[_type == "formSubmission" && formType == "villaComment" && _id match "formSubmission-villaComment-seed-*"]._id`
  );

  for (const id of existing) {
    transaction.delete(id);
  }

  let total = 0;
  for (const villa of STATIC_VILLAS) {
    const villaDocId = `villa-${villa.slug}`;
    const comments = pickVillaComments(villa);

    comments.forEach((comment, index) => {
      transaction.createOrReplace({
        _id: `formSubmission-villaComment-seed-${villa.slug}-${index + 1}`,
        _type: "formSubmission",
        formType: "villaComment",
        status: "published",
        submittedAt: comment.submittedAt,
        name: comment.guestName,
        email: `${comment.guestName.replace(/\W+/g, "").toLowerCase()}@guest.example`,
        rating: comment.rating,
        message: comment.message,
        villaRef: { _type: "reference", _ref: villaDocId },
        language: "en",
      });
      total += 1;
    });

    console.log(`Queued ${comments.length} comments for ${villa.name}`);
  }

  await transaction.commit();
  console.log(
    `Seeded ${total} villa comments (${existing.length} previous seed docs replaced).`
  );
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
