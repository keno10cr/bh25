import { createClient } from "@sanity/client";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";

const OLD_SLUGS = [
  "heliconias-around-blessed-house",
  "spot-sloths-in-the-garden",
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

async function run() {
  const client = await getClient();
  const ids = await client.fetch(
    `*[_type == "blog" && slug.current in $slugs]._id`,
    { slugs: OLD_SLUGS }
  );
  if (!ids.length) {
    console.log("No old posts found.");
    return;
  }
  const transaction = client.transaction();
  ids.forEach((id) => transaction.delete(id));
  await transaction.commit();
  console.log(`Deleted ${ids.length} posts: ${ids.join(", ")}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
