import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { STATIC_ACTIVITIES } from "../src/data/activities.js";
import { STATIC_BLOG_POSTS } from "../src/data/blog.js";
import {
  ABOUT_PAGE_DEFAULTS,
  ACTIVITIES_PAGE_DEFAULTS,
  BLOG_PAGE_DEFAULTS,
  CONTACT_PAGE_DEFAULTS,
  GALLERY_PAGE_DEFAULTS,
  HOME_PAGE_DEFAULTS,
  VILLAS_PAGE_DEFAULTS,
} from "../src/data/page-defaults.js";
import { STATIC_REVIEWS } from "../src/data/reviews.js";
import { STATIC_VILLAS } from "../src/data/villas.js";
import { translations } from "../src/lib/translations.js";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "../sanity/env.js";
import {
  LEGEND_ITEMS,
  legendDocument,
  legendRefsForCategory,
} from "./legend-items.js";
import { toWhatsIncludedItems } from "./whats-included.js";

const en = translations.en;
const imageCache = new Map();

function toBlocks(text, prefix) {
  return String(text || "")
    .split(/\n\n+/)
    .filter(Boolean)
    .map((paragraph, index) => ({
      _type: "block",
      _key: `${prefix}-${index}`,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `${prefix}-s${index}`,
          text: paragraph,
          marks: [],
        },
      ],
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

function villaAmenities(villa) {
  const labels = en.villas.amenities;
  const items = (villa.amenities || []).map((key) => labels[key] || key);
  if (villa.bedInfo && en.villas.bedInfo[villa.bedInfo]) {
    items.push(en.villas.bedInfo[villa.bedInfo]);
  }
  return items;
}

async function seed() {
  const client = await getClient();
  const transaction = client.transaction();

  for (const item of LEGEND_ITEMS) {
    transaction.createOrReplace(legendDocument(item));
  }

  transaction.createOrReplace({
    _id: "homePageSettings",
    _type: "homePageSettings",
    ...HOME_PAGE_DEFAULTS,
  });
  transaction.createOrReplace({
    _id: "aboutPageSettings",
    _type: "aboutPageSettings",
    ...ABOUT_PAGE_DEFAULTS,
  });
  const { heroImage: _contactHero, heroImageAlt: _contactHeroAlt, ...contactCopy } =
    CONTACT_PAGE_DEFAULTS;
  transaction.createOrReplace({
    _id: "contactPageSettings",
    _type: "contactPageSettings",
    ...contactCopy,
  });
  transaction.createOrReplace({
    _id: "galleryPageSettings",
    _type: "galleryPageSettings",
    ...GALLERY_PAGE_DEFAULTS,
  });
  transaction.createOrReplace({
    _id: "activitiesPageSettings",
    _type: "activitiesPageSettings",
    ...ACTIVITIES_PAGE_DEFAULTS,
  });
  transaction.createOrReplace({
    _id: "blogPageSettings",
    _type: "blogPageSettings",
    ...BLOG_PAGE_DEFAULTS,
  });
  transaction.createOrReplace({
    _id: "villasPageSettings",
    _type: "villasPageSettings",
    ...VILLAS_PAGE_DEFAULTS,
  });

  for (const villa of STATIC_VILLAS) {
    const copy = en.villas[villa.translationKey] || {};
    const galleryPaths = [villa.image, ...(villa.galleryImages || [])].filter(
      (src, index, list) => src && list.indexOf(src) === index
    );
    const gallery = [];
    for (const src of galleryPaths) {
      const image = await uploadImage(client, src);
      if (image) gallery.push({ ...image, _key: src.replace(/[^\w]+/g, "-") });
    }

    const descriptionParts = [copy.description, copy.informativeFact].filter(Boolean);
    transaction.createOrReplace({
      _id: `villa-${villa.slug}`,
      _type: "villa",
      name: villa.name,
      slug: { _type: "slug", current: villa.slug },
      capacity: villa.maxPeople,
      bedrooms: villa.bedrooms,
      bathrooms: villa.bathrooms,
      amenities: villaAmenities(villa),
      gallery,
      description: toBlocks(descriptionParts.join("\n\n"), villa.slug),
      bookingUrl: villa.bookingUrl,
    });
    console.log(`Queued villa ${villa.name}`);
  }

  for (const activity of STATIC_ACTIVITIES) {
    const copy = en.activitiesPage[activity.translationKey] || {};
    const image = await uploadImage(client, activity.image);
    const difficulty =
      activity.difficulty && activity.difficulty !== "N/A"
        ? activity.difficulty
        : undefined;
    transaction.createOrReplace({
      _id: `activity-${activity.slug}`,
      _type: "activity",
      title: copy.name || activity.title || activity.slug,
      slug: { _type: "slug", current: activity.slug },
      category: activity.category,
      legendItems: legendRefsForCategory(activity.category),
      difficulty,
      duration: activity.duration,
      groupSize: activity.groupSize,
      coordinates: activity.coordinates
        ? {
            _type: "geopoint",
            lat: activity.coordinates.lat,
            lng: activity.coordinates.lng,
          }
        : undefined,
      image,
      description: toBlocks(
        [copy.description, copy.fullDescription].filter(Boolean).join("\n\n"),
        activity.slug
      ),
      whatsIncluded: toWhatsIncludedItems(copy.highlights, activity.slug),
    });
    console.log(`Queued activity ${copy.name || activity.slug}`);
  }

  for (const review of STATIC_REVIEWS) {
    transaction.createOrReplace({
      _id: `review-${review.id}`,
      _type: "review",
      guestName: review.guestName,
      date: review.date,
      rating: review.rating,
      comment: review.comment,
    });
  }

  for (const post of STATIC_BLOG_POSTS) {
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
      content: post.content?.length
        ? post.content.map((block, index) => ({
            ...block,
            _key: block._key || `${post.slug}-${index}`,
            children: (block.children || []).map((child, childIndex) => ({
              ...child,
              _key: child._key || `${post.slug}-c${index}-${childIndex}`,
            })),
          }))
        : toBlocks(post.excerpt, post.slug),
    });
    console.log(`Queued blog ${post.title}`);
  }

  console.log("Committing documents...");
  await transaction.commit({ autoGenerateArrayKeys: true });
  console.log("Sanity seed complete.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
