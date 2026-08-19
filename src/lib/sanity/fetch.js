import { createSanityReadClient } from "./client";

export async function sanityFetch(query, params = {}) {
  try {
    const client = createSanityReadClient();
    return await client.fetch(query, params, {
      next: { revalidate: 60 },
    });
  } catch (error) {
    console.error("Sanity fetch failed:", error);
    return null;
  }
}
