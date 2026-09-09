/**
 * Fill empty socialTitle and socialHook on published blog posts.
 * Existing custom values are left as is.
 *
 * Run: npm run patch:blog-social
 */
import { createClient } from "next-sanity";
import { BLOG_SOCIAL_COPY, socialCopyFor } from "../src/data/blog-social.js";
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

async function main() {
  const client = await getClient();
  const posts = await client.fetch(
    `*[_type == "blog"]{_id, title, excerpt, socialTitle, socialHook, "slug": slug.current}`
  );

  let updated = 0;
  for (const post of posts) {
    const copy = BLOG_SOCIAL_COPY[post.slug] || socialCopyFor(post.slug, post);
    const patch = {};
    if (!String(post.socialTitle || "").trim() && copy.socialTitle) {
      patch.socialTitle = copy.socialTitle;
    }
    if (!String(post.socialHook || "").trim() && copy.socialHook) {
      patch.socialHook = copy.socialHook;
    }
    if (!Object.keys(patch).length) continue;

    await client.patch(post._id).set(patch).commit();
    updated += 1;
    console.log(`updated ${post.slug}: ${Object.keys(patch).join(", ")}`);
  }

  console.log(`Done. ${updated} of ${posts.length} posts updated.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
