import { sanityFetch } from "@/lib/sanity/fetch";
import { STATIC_BLOG_POSTS } from "@/data/blog";
import { socialCopyFor } from "@/data/blog-social";

const SOCIAL_POST_QUERY = `*[_type == "blog" && slug.current == $slug][0]{
  title,
  socialTitle,
  socialHook,
  "slug": slug.current,
  category,
  excerpt,
  "mainImageUrl": featuredImage.asset->url
}`;

export const SOCIAL_SAMPLE_POST = {
  title: "Jaguars of the coastal forest",
  socialTitle: "Jaguars of the coastal forest",
  slug: "journal-villa-5-jaguar",
  category: "Fauna",
  socialHook:
    "The largest cat in the Americas still moves through Caribbean forest, even when you never see one.",
  description:
    "The largest cat in the Americas still moves through Caribbean forest, even when you never see one.",
  mainImageUrl: null,
};

export function resolveSocialImageUrl(src, origin) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) {
    if (src.includes("cdn.sanity.io") && !src.includes("?")) {
      return `${src}?w=1400&h=1400&fit=max`;
    }
    return src;
  }
  const base = String(origin || "").replace(/\/$/, "");
  const path = src.startsWith("/") ? src : `/${src}`;
  return base ? `${base}${path}` : path;
}

export function toSocialPost(raw, fallback = SOCIAL_SAMPLE_POST) {
  const source = raw || fallback;
  const slug = source.slug || fallback.slug;
  const curated = socialCopyFor(slug, {
    title: source.title || fallback.title,
    excerpt: source.excerpt || source.description || fallback.description,
  });
  const socialTitle = source.socialTitle || curated.socialTitle;
  const socialHook =
    source.socialHook || source.description || curated.socialHook;
  return {
    title: socialTitle || source.title || fallback.title,
    editorialTitle: source.title || fallback.title,
    socialTitle,
    slug,
    category: source.category || fallback.category,
    description: socialHook || source.excerpt || fallback.description,
    socialHook,
    mainImageUrl: source.mainImageUrl || source.featuredImage || null,
  };
}

export async function loadSocialPost(slug) {
  if (!slug) return toSocialPost(SOCIAL_SAMPLE_POST);

  const raw = await sanityFetch(SOCIAL_POST_QUERY, { slug });
  if (raw?.title) return toSocialPost(raw);

  const fallback = STATIC_BLOG_POSTS.find((post) => post.slug === slug);
  if (fallback) {
    return toSocialPost({
      title: fallback.title,
      socialTitle: fallback.socialTitle,
      socialHook: fallback.socialHook,
      slug: fallback.slug,
      category: fallback.category,
      excerpt: fallback.excerpt,
      featuredImage: fallback.featuredImage,
    });
  }

  return null;
}
