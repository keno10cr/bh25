import { sanityFetch } from "./fetch";
import {
  aboutPageSettingsQuery,
  activitiesPageSettingsQuery,
  activitiesQuery,
  activityBySlugQuery,
  activitySlugsQuery,
  legendItemsQuery,
  blogPageSettingsQuery,
  blogPostBySlugQuery,
  blogPostsQuery,
  contactPageSettingsQuery,
  homePageSettingsQuery,
  reviewsQuery,
  villaBySlugQuery,
  villaSlugsQuery,
  villasPageSettingsQuery,
  villasQuery,
} from "./queries";
import {
  mapActivity,
  mapBlogPost,
  mapPageSettings,
  mapReview,
  mapThingsToDoItems,
  mapFeaturedItems,
  mapVilla,
} from "./mappers";
import { STATIC_ACTIVITIES } from "@/data/activities";
import { STATIC_VILLAS } from "@/data/villas";
import { STATIC_REVIEWS } from "@/data/reviews";
import { STATIC_BLOG_POSTS } from "@/data/blog";
import {
  ABOUT_PAGE_DEFAULTS,
  ACTIVITIES_PAGE_DEFAULTS,
  BLOG_PAGE_DEFAULTS,
  VILLAS_PAGE_DEFAULTS,
  CONTACT_PAGE_DEFAULTS,
  HOME_PAGE_DEFAULTS,
  HOME_THINGS_TO_DO,
  HOME_FEATURED_ITEMS,
} from "@/data/page-defaults";

function mergeBySlug(sanityItems, fallbackItems, mapFn) {
  const fallbackBySlug = new Map(
    fallbackItems.map((item) => [item.slug, item])
  );
  if (!Array.isArray(sanityItems) || sanityItems.length === 0) {
    return fallbackItems.map((item) => mapFn(null, item));
  }

  const used = new Set();
  const mapped = sanityItems.map((raw) => {
    const fallback = fallbackBySlug.get(raw.slug) || null;
    if (raw.slug) used.add(raw.slug);
    return mapFn(raw, fallback);
  });

  fallbackItems.forEach((item) => {
    if (!used.has(item.slug)) {
      mapped.push(mapFn(null, item));
    }
  });

  return mapped;
}

export async function getActivities() {
  const raw = await sanityFetch(activitiesQuery);
  return mergeBySlug(raw, STATIC_ACTIVITIES, mapActivity).map(
    (activity, index) => ({
      ...activity,
      number: index + 1,
    })
  );
}

export async function getActivityBySlug(slug) {
  const raw = await sanityFetch(activityBySlugQuery, { slug });
  const fallback = STATIC_ACTIVITIES.find((item) => item.slug === slug) || null;
  if (!raw && !fallback) return null;
  const activities = await getActivities();
  const numbered = activities.find((item) => item.slug === slug);
  return numbered || mapActivity(raw, fallback);
}

export async function getActivitySlugs() {
  const raw = await sanityFetch(activitySlugsQuery);
  const slugs = new Set(
    [
      ...STATIC_ACTIVITIES.map((item) => item.slug),
      ...((Array.isArray(raw) && raw) || []),
    ].filter(Boolean)
  );
  return [...slugs];
}

export async function getLegendItems() {
  const raw = await sanityFetch(legendItemsQuery);
  if (Array.isArray(raw) && raw.length > 0) return raw;
  return [
    { title: "Beaches", slug: "beaches", color: "#2e86ab" },
    { title: "Blessed House", slug: "blessed-house", color: "#0a4c3a" },
    { title: "Waterfalls", slug: "waterfalls", color: "#3d8b6e" },
    { title: "Tours", slug: "tours", color: "#e8a838" },
  ];
}

export async function getMapActivities() {
  const activities = await getActivities();
  return activities.filter(
    (activity) => activity.coordinates?.lat && activity.coordinates?.lng
  );
}

export async function getVillas() {
  const raw = await sanityFetch(villasQuery);
  return mergeBySlug(raw, STATIC_VILLAS, mapVilla);
}

export async function getVillaBySlug(slug) {
  const raw = await sanityFetch(villaBySlugQuery, { slug });
  const fallback = STATIC_VILLAS.find((villa) => villa.slug === slug) || null;
  if (!raw && !fallback) return null;
  return mapVilla(raw, fallback);
}

export async function getVillaSlugs() {
  const raw = await sanityFetch(villaSlugsQuery);
  const slugs = new Set(
    [
      ...STATIC_VILLAS.map((villa) => villa.slug),
      ...((Array.isArray(raw) && raw) || []),
    ].filter(Boolean)
  );
  return [...slugs];
}

export async function getReviews() {
  const raw = await sanityFetch(reviewsQuery);
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map(mapReview).filter(Boolean);
  }
  return STATIC_REVIEWS.map((review) => ({ ...review, fromCms: false }));
}

function isPublished(post) {
  if (!post?.publishedAt) return true;
  return new Date(post.publishedAt).getTime() <= Date.now();
}

export async function getBlogPosts() {
  const raw = await sanityFetch(blogPostsQuery);
  return mergeBySlug(raw, STATIC_BLOG_POSTS, mapBlogPost).filter(isPublished);
}

export async function getBlogPostBySlug(slug) {
  const raw = await sanityFetch(blogPostBySlugQuery, { slug });
  const fallback = STATIC_BLOG_POSTS.find((post) => post.slug === slug) || null;
  if (!raw && !fallback) return null;
  const post = mapBlogPost(raw, fallback);
  if (!isPublished(post)) return null;
  return post;
}

export async function getHomePageSettings() {
  const raw = await sanityFetch(homePageSettingsQuery);
  const mapped = mapPageSettings(raw, HOME_PAGE_DEFAULTS);
  mapped.thingsToDoItems = mapThingsToDoItems(
    raw?.thingsToDoItems,
    HOME_THINGS_TO_DO
  );
  mapped.featuredItems = mapFeaturedItems(
    raw?.featuredItems,
    HOME_FEATURED_ITEMS
  );
  return mapped;
}

export async function getAboutPageSettings() {
  const raw = await sanityFetch(aboutPageSettingsQuery);
  return mapPageSettings(raw, ABOUT_PAGE_DEFAULTS);
}

export async function getContactPageSettings() {
  const raw = await sanityFetch(contactPageSettingsQuery);
  return mapPageSettings(raw, CONTACT_PAGE_DEFAULTS);
}

export async function getActivitiesPageSettings() {
  const raw = await sanityFetch(activitiesPageSettingsQuery);
  return mapPageSettings(raw, ACTIVITIES_PAGE_DEFAULTS);
}

export async function getBlogPageSettings() {
  const raw = await sanityFetch(blogPageSettingsQuery);
  return mapPageSettings(raw, BLOG_PAGE_DEFAULTS);
}

export async function getVillasPageSettings() {
  const raw = await sanityFetch(villasPageSettingsQuery);
  return mapPageSettings(raw, VILLAS_PAGE_DEFAULTS);
}

export async function getBlogSlugs() {
  const posts = await getBlogPosts();
  return posts.map((post) => post.slug).filter(Boolean);
}
