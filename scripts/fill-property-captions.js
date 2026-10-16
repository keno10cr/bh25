/**
 * Translate English property photo captions into the other site languages.
 * English is the source. Re-run after caption edits: a translation is
 * refreshed only when its English line changed.
 *
 * Usage: npm run translate:captions
 * Optional: npm run translate:captions -- --seed
 *   fills an empty caption from scripts/property-caption-seed.js
 */
import { createClient } from "@sanity/client";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";
import { syncPropertyCaptions } from "../src/lib/property-caption-sync.js";
import { PROPERTY_CAPTION_SEED } from "./property-caption-seed.js";

async function main() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) throw new Error("SANITY_API_WRITE_TOKEN is missing from .env.local");
  const client = createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    token,
    useCdn: false,
  });
  const useSeed = process.argv.includes("--seed");
  const result = await syncPropertyCaptions(client, {
    seed: useSeed ? PROPERTY_CAPTION_SEED : {},
  });
  console.log(
    `Done. Updated ${result.documents} properties, wrote ${result.captionsWritten} English captions, translated ${result.translated}. Skipped ${result.skipped} already up to date.`
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
