import { NextResponse } from "next/server";
import { loadSocialPost } from "@/lib/social/load-post";
import {
  requestOrigin,
  socialRequestAllowed,
  socialSecretFromRequest,
} from "@/lib/social/auth";
import { buildSocialPack } from "@/lib/social/pack";
import { SITE_URL } from "@/lib/siteMetadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function packOrigin(request) {
  if (process.env.NODE_ENV === "production") return SITE_URL;
  return requestOrigin(request);
}

function denied() {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}

export async function GET(request) {
  if (!socialRequestAllowed(request)) return denied();

  const slug = String(request.nextUrl.searchParams.get("slug") || "").trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400 });
  }

  const post = await loadSocialPost(slug);
  if (!post) {
    return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
  }

  const pack = buildSocialPack({
    post,
    origin: packOrigin(request),
    secret: socialSecretFromRequest(request),
  });

  return NextResponse.json(pack);
}
