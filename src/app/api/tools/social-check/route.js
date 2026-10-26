import { NextResponse } from "next/server";
import { isToolRequestAuthorized } from "@/lib/toolAuth";
import { requestOrigin } from "@/lib/social/auth";
import { loadSocialPost } from "@/lib/social/load-post";
import { runSocialCheck } from "@/lib/social/check";
import { sanityFetch } from "@/lib/sanity/fetch";
import { SITE_URL } from "@/lib/siteMetadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RECENT_POSTS_QUERY = `*[_type == "blog" && defined(slug.current) && !(_id in path("drafts.**"))] | order(coalesce(publishedAt, _createdAt) desc)[0...80]{
  title,
  "slug": slug.current,
  "publishedAt": coalesce(publishedAt, _createdAt)
}`;

/** Live posts newest first, then scheduled posts soonest first. */
function orderPosts(posts) {
  const now = Date.now();
  const withFlag = (posts || []).map((post) => ({
    ...post,
    scheduled: Date.parse(post.publishedAt || "") > now,
  }));
  const live = withFlag.filter((post) => !post.scheduled);
  const scheduled = withFlag.filter((post) => post.scheduled).reverse();
  return [...live, ...scheduled];
}

/** Make.com reads production, so that is the default target. */
function checkOrigin(request) {
  const target = request.nextUrl.searchParams.get("target");
  return target === "this" ? requestOrigin(request) : SITE_URL;
}

export async function GET(request) {
  if (!(await isToolRequestAuthorized(request))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const slug = String(request.nextUrl.searchParams.get("slug") || "").trim();

  if (!slug) {
    try {
      const posts = await sanityFetch(RECENT_POSTS_QUERY);
      return NextResponse.json({ posts: orderPosts(posts) });
    } catch (error) {
      console.error("[social-check] posts", error);
      return NextResponse.json({ posts: [] });
    }
  }

  const post = await loadSocialPost(slug);
  if (!post) {
    return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
  }

  const result = await runSocialCheck({ post, origin: checkOrigin(request) });
  if (!result) {
    return NextResponse.json({ error: "Could not build the social pack." }, { status: 500 });
  }
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
