/**
 * Fill empty featuredImage.alt and inline image alt fields on blog posts.
 * Custom editor alts are left as is. Punta Mona and other known slugs use
 * the same phrases as the frontend fallback.
 *
 * Run: npm run patch:blog-alts
 */
import { createClient } from "next-sanity";
import { blogImageAlt } from "../src/lib/blog-image-alt.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";

const CONTENT_FIELDS = [
  "content",
  "contentEs",
  "contentDe",
  "contentNl",
  "contentFr",
  "contentJa",
  "contentPt",
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

function withImageAlts(blocks, context) {
  if (!Array.isArray(blocks)) return { blocks, changed: false };

  let changed = false;
  const next = blocks.map((block) => {
    if (block?._type !== "image") return block;
    if (String(block.alt || "").trim()) return block;
    changed = true;
    return {
      ...block,
      alt: blogImageAlt({ ...context, kind: "photo" }),
    };
  });

  return { blocks: next, changed };
}

async function patchBlogImageAlts() {
  const client = await getClient();
  const posts = await client.fetch(
    `*[_type == "blog"]{
      _id,
      title,
      category,
      "slug": slug.current,
      featuredImage,
      content,
      contentEs,
      contentDe,
      contentNl,
      contentFr,
      contentJa,
      contentPt
    }`
  );

  let patched = 0;

  for (const post of posts || []) {
    const context = {
      title: post.title,
      category: post.category,
      slug: post.slug,
    };
    const set = {};

    if (post.featuredImage?.asset && !String(post.featuredImage.alt || "").trim()) {
      set["featuredImage.alt"] = blogImageAlt(context);
    }

    for (const field of CONTENT_FIELDS) {
      const { blocks, changed } = withImageAlts(post[field], context);
      if (changed) set[field] = blocks;
    }

    if (Object.keys(set).length === 0) continue;

    await client.patch(post._id).set(set).commit({ autoGenerateArrayKeys: true });
    patched += 1;
    console.log(`Patched ${post.slug || post._id}`);
  }

  console.log(`Updated alt text on ${patched} blog document(s).`);
}

patchBlogImageAlts().catch((error) => {
  console.error(error);
  process.exit(1);
});
