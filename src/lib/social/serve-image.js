import { NextResponse } from "next/server";
import {
  loadSocialPost,
  resolveSocialImageUrl,
  SOCIAL_SAMPLE_POST,
  toSocialPost,
} from "@/lib/social/load-post";
import { getSocialPlatform } from "@/lib/social/platforms";
import { renderSocialPost } from "@/lib/social/render-post";

export function parseSocialImageFileName(file) {
  return String(file || "")
    .trim()
    .replace(/\.jpe?g$/i, "");
}

export async function serveSocialJpeg({
  platformKey,
  slug,
  origin,
  fallbackParams = null,
  cacheControl = "public, max-age=300, s-maxage=3600",
}) {
  if (!getSocialPlatform(platformKey)) {
    return NextResponse.json({ error: "Unknown platform." }, { status: 400 });
  }

  const post = slug
    ? await loadSocialPost(slug)
    : fallbackParams
      ? toSocialPost({ ...SOCIAL_SAMPLE_POST, ...fallbackParams })
      : null;

  if (!post) {
    return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
  }

  const imageUrl = resolveSocialImageUrl(post.mainImageUrl, origin);
  const response = await renderSocialPost({
    platformKey,
    post,
    imageUrl,
  });

  response.headers.set("Cache-Control", cacheControl);
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
}
