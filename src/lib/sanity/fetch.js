import { CONTENT_REVALIDATE_SECONDS } from "@/lib/cache";
import { createSanityReadClient } from "./client";

export async function sanityFetch(query, params = {}) {
  try {
    const client = createSanityReadClient();
    return await client.fetch(query, params, {
      next: { revalidate: CONTENT_REVALIDATE_SECONDS },
    });
  } catch (error) {
    console.error("Sanity fetch failed:", error);
    return null;
  }
}
