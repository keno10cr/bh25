import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { SERIES_BLOG_POSTS } from "../src/data/blog-series.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";

const imageCache = new Map();

function publicPath(relative) {
  return path.join(process.cwd(), "public", String(relative || "").replace(/^\//, ""));
}

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

async function uploadImage(client, relativePath) {
  if (!relativePath) return undefined;
  if (imageCache.has(relativePath)) return imageCache.get(relativePath);

  const filePath = publicPath(relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping missing image: ${relativePath}`);
    imageCache.set(relativePath, undefined);
    return undefined;
  }

  const buffer = fs.readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(filePath),
  });
  const image = {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
  imageCache.set(relativePath, image);
  return image;
}

async function seed() {
  const client = await getClient();
  const transaction = client.transaction();

  for (const post of SERIES_BLOG_POSTS) {
    const featuredImage = await uploadImage(client, post.featuredImage);
    transaction.createOrReplace({
      _id: `blog-${post.slug}`,
      _type: "blog",
      title: post.title,
      slug: { _type: "slug", current: post.slug },
      category: post.category,
      publishedAt: post.publishedAt,
      excerpt: post.excerpt,
      featuredImage,
      content: (post.content || []).map((block, index) => ({
        ...block,
        _key: block._key || `${post.slug}-${index}`,
        children: (block.children || []).map((child, childIndex) => ({
          ...child,
          _key: child._key || `${post.slug}-c${index}-${childIndex}`,
        })),
      })),
    });
    console.log(`Queued ${post.publishedAt.slice(0, 10)} ${post.title}`);
  }

  console.log("Committing blog series...");
  await transaction.commit({ autoGenerateArrayKeys: true });
  console.log(`Seeded ${SERIES_BLOG_POSTS.length} scheduled posts.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
