import { createClient } from "next-sanity";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../../../sanity/env";

/**
 * True when this bearer is accepted by the Blessed House Sanity project.
 * A missing or fake token is rejected. The public dataset can be read
 * without a token, so this always sends the token.
 */
export async function isCaptionTranslator(token) {
  const bearer = String(token || "").trim();
  if (!bearer || bearer.length > 2000 || /[\r\n]/.test(bearer)) return false;
  const client = createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    token: bearer,
    useCdn: false,
  });
  try {
    await client.fetch(`count(*[_type == "property"])`);
    return true;
  } catch {
    return false;
  }
}
