import { NextResponse } from "next/server";
import {
  loadSocialPost,
  resolveSocialImageUrl,
  SOCIAL_SAMPLE_POST,
  toSocialPost,
} from "@/lib/social/load-post";
import { getSocialPlatform, SOCIAL_PLATFORM_KEYS } from "@/lib/social/platforms";
import { renderSocialPost } from "@/lib/social/render-post";
import { requestOrigin, socialRequestAllowed } from "@/lib/social/auth";

export const runtime = "nodejs";

export async function GET(request) {
  if (!socialRequestAllowed(request)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const platformKey = searchParams.get("platform") || "instagram";
  if (!getSocialPlatform(platformKey)) {
    return NextResponse.json(
      { error: "Unknown platform.", platforms: SOCIAL_PLATFORM_KEYS },
      { status: 400 }
    );
  }

  const slug = searchParams.get("slug") || "";
  const post = slug
    ? await loadSocialPost(slug)
    : toSocialPost({
        title: searchParams.get("title") || SOCIAL_SAMPLE_POST.title,
        socialTitle:
          searchParams.get("socialTitle") || searchParams.get("title"),
        socialHook:
          searchParams.get("socialHook") || searchParams.get("description"),
        category: searchParams.get("category") || SOCIAL_SAMPLE_POST.category,
        description:
          searchParams.get("description") || SOCIAL_SAMPLE_POST.description,
        mainImageUrl: searchParams.get("image") || searchParams.get("mainImageUrl"),
        slug: "sample",
      });

  if (!post) {
    return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
  }

  const imageUrl = resolveSocialImageUrl(post.mainImageUrl, requestOrigin(request));

  try {
    return renderSocialPost({
      platformKey,
      post,
      imageUrl,
    });
  } catch (error) {
    console.error("[social/preview]", error);
    return NextResponse.json(
      { error: "Could not render social image." },
      { status: 500 }
    );
  }
}
