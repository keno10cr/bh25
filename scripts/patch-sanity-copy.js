import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import {
  ABOUT_PAGE_DEFAULTS,
  ACTIVITIES_PAGE_DEFAULTS,
  BLOG_PAGE_DEFAULTS,
  CONTACT_PAGE_DEFAULTS,
  GALLERY_PAGE_DEFAULTS,
  HOME_PAGE_DEFAULTS,
  HOME_THINGS_TO_DO,
  HOME_FEATURED_ITEMS,
  VILLAS_PAGE_DEFAULTS,
} from "../src/data/page-defaults.js";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "../sanity/env.js";

const imageCache = new Map();

function dehyphenate(text) {
  if (typeof text !== "string" || !text) return text;
  return text
    .replace(/[—–]/g, ",")
    .replace(/(\d)\s*-\s*(\d)/g, "$1 to $2")
    .replace(/([A-Za-z])-([A-Za-z])/g, "$1 $2");
}

function dehyphenateBlocks(blocks) {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.map((block) => ({
    ...block,
    children: Array.isArray(block.children)
      ? block.children.map((child) => ({
          ...child,
          text: dehyphenate(child.text),
        }))
      : block.children,
  }));
}

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

async function patch() {
  const client = await getClient();

  const thingsToDoItems = [];
  for (const item of HOME_THINGS_TO_DO) {
    const image = await uploadImage(client, item.image);
    thingsToDoItems.push({
      _type: "object",
      _key: item.id,
      title: item.title,
      description: item.description,
      image,
    });
  }

  const featuredItems = [];
  for (const item of HOME_FEATURED_ITEMS) {
    const image = await uploadImage(client, item.image);
    featuredItems.push({
      _type: "object",
      _key: item.slug,
      slug: item.slug,
      name: item.name,
      teaser: item.teaser,
      image,
    });
  }

  await client.createOrReplace({
    _id: "homePageSettings",
    _type: "homePageSettings",
    ...HOME_PAGE_DEFAULTS,
    thingsToDoItems,
    featuredItems,
  });
  await client.createOrReplace({
    _id: "aboutPageSettings",
    _type: "aboutPageSettings",
    ...ABOUT_PAGE_DEFAULTS,
  });
  const { heroImage: _contactHero, heroImageAlt: _contactHeroAlt, ...contactCopy } =
    CONTACT_PAGE_DEFAULTS;
  await client.createOrReplace({
    _id: "contactPageSettings",
    _type: "contactPageSettings",
    ...contactCopy,
  });
  await client.createOrReplace({
    _id: "galleryPageSettings",
    _type: "galleryPageSettings",
    ...GALLERY_PAGE_DEFAULTS,
  });
  await client.createOrReplace({
    _id: "activitiesPageSettings",
    _type: "activitiesPageSettings",
    ...ACTIVITIES_PAGE_DEFAULTS,
  });
  await client.createOrReplace({
    _id: "blogPageSettings",
    _type: "blogPageSettings",
    ...BLOG_PAGE_DEFAULTS,
  });
  await client.createOrReplace({
    _id: "villasPageSettings",
    _type: "villasPageSettings",
    ...VILLAS_PAGE_DEFAULTS,
  });
  console.log("Updated page singletons and Things to Do cards");

  const villas = await client.fetch(`*[_type == "villa"]{_id, name, description, amenities}`);
  for (const villa of villas) {
    await client
      .patch(villa._id)
      .set({
        name: dehyphenate(villa.name),
        amenities: Array.isArray(villa.amenities)
          ? villa.amenities.map(dehyphenate)
          : villa.amenities,
        description: dehyphenateBlocks(villa.description),
      })
      .commit();
  }
  console.log(`Updated ${villas.length} villas`);

  const activities = await client.fetch(
    `*[_type == "activity"]{_id, title, duration, groupSize, description}`
  );
  for (const activity of activities) {
    await client
      .patch(activity._id)
      .set({
        title: dehyphenate(activity.title),
        duration: dehyphenate(activity.duration),
        groupSize: dehyphenate(activity.groupSize),
        description: dehyphenateBlocks(activity.description),
      })
      .commit();
  }
  console.log(`Updated ${activities.length} activities`);

  const posts = await client.fetch(`*[_type == "blog"]{_id, title, excerpt, content}`);
  for (const post of posts) {
    await client
      .patch(post._id)
      .set({
        title: dehyphenate(post.title),
        excerpt: dehyphenate(post.excerpt),
        content: dehyphenateBlocks(post.content),
      })
      .commit();
  }
  console.log(`Updated ${posts.length} blog posts`);

  const reviews = await client.fetch(`*[_type == "review"]{_id, comment}`);
  for (const review of reviews) {
    await client.patch(review._id).set({ comment: dehyphenate(review.comment) }).commit();
  }
  console.log(`Updated ${reviews.length} reviews`);

  console.log("Sanity copy patch complete.");
}

patch().catch((error) => {
  console.error(error);
  process.exit(1);
});
