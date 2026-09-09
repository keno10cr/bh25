import { SITE_URL } from "@/lib/siteMetadata";
import { SOCIAL_PLATFORMS } from "@/lib/social/platforms";

export const SOCIAL_PACK_PATH = "/api/social/pack";
export const SOCIAL_PREVIEW_PATH = "/api/social/preview";

export const SOCIAL_IMAGE_PACKS = {
  feed: {
    key: "feed",
    platform: "instagram",
    platforms: ["instagram", "facebook", "x", "bluesky"],
    width: SOCIAL_PLATFORMS.instagram.width,
    height: SOCIAL_PLATFORMS.instagram.height,
  },
  tiktok: {
    key: "tiktok",
    platform: "tiktok",
    platforms: ["tiktok"],
    width: SOCIAL_PLATFORMS.tiktok.width,
    height: SOCIAL_PLATFORMS.tiktok.height,
  },
  pinterest: {
    key: "pinterest",
    platform: "pinterest",
    platforms: ["pinterest"],
    width: SOCIAL_PLATFORMS.pinterest.width,
    height: SOCIAL_PLATFORMS.pinterest.height,
  },
};

/**
 * @typedef {Object} SocialImageRef
 * @property {string[]} platforms
 * @property {number} width
 * @property {number} height
 * @property {string} url
 *
 * @typedef {Object} SocialPack
 * @property {string} slug
 * @property {string} title
 * @property {string} socialTitle
 * @property {string} socialHook
 * @property {string} url
 * @property {string} [category]
 * @property {string} [mainImageUrl]
 * @property {{ feed: SocialImageRef, tiktok: SocialImageRef, pinterest: SocialImageRef }} images
 */

function trimSlash(origin) {
  return String(origin || SITE_URL).replace(/\/$/, "");
}

export function socialPreviewUrl({
  origin = SITE_URL,
  platform,
  slug,
  secret = "",
}) {
  const url = new URL(SOCIAL_PREVIEW_PATH, `${trimSlash(origin)}/`);
  url.searchParams.set("platform", platform);
  url.searchParams.set("slug", slug);
  if (secret) url.searchParams.set("secret", secret);
  return url.toString();
}

export function socialPackUrl({ origin = SITE_URL, slug, secret = "" }) {
  const url = new URL(SOCIAL_PACK_PATH, `${trimSlash(origin)}/`);
  url.searchParams.set("slug", slug);
  if (secret) url.searchParams.set("secret", secret);
  return url.toString();
}

export function blogPostUrl(slug, origin = SITE_URL) {
  return `${trimSlash(origin)}/blog/${slug}`;
}

/**
 * @param {{
 *   post: {
 *     slug?: string,
 *     title?: string,
 *     editorialTitle?: string,
 *     socialTitle?: string,
 *     socialHook?: string,
 *     description?: string,
 *     category?: string,
 *     mainImageUrl?: string | null,
 *   },
 *   origin?: string,
 *   secret?: string,
 * }} input
 * @returns {SocialPack | null}
 */
export function buildSocialPack({ post, origin = SITE_URL, secret = "" }) {
  const slug = String(post?.slug || "").trim();
  if (!slug) return null;

  const socialTitle =
    String(post.socialTitle || post.title || post.editorialTitle || "").trim();
  const socialHook = String(
    post.socialHook || post.description || ""
  ).trim();

  const image = (pack) => ({
    platforms: pack.platforms,
    width: pack.width,
    height: pack.height,
    url: socialPreviewUrl({
      origin,
      platform: pack.platform,
      slug,
      secret,
    }),
  });

  return {
    slug,
    title: String(post.editorialTitle || post.title || socialTitle).trim(),
    socialTitle,
    socialHook,
    url: blogPostUrl(slug, origin),
    category: post.category || "",
    mainImageUrl: post.mainImageUrl || null,
    images: {
      feed: image(SOCIAL_IMAGE_PACKS.feed),
      tiktok: image(SOCIAL_IMAGE_PACKS.tiktok),
      pinterest: image(SOCIAL_IMAGE_PACKS.pinterest),
    },
  };
}
