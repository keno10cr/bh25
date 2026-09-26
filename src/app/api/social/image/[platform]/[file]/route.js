import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/siteMetadata";
import { requestOrigin } from "@/lib/social/auth";
import { getSocialPlatform } from "@/lib/social/platforms";
import {
  parseSocialImageFileName,
  serveSocialJpeg,
} from "@/lib/social/serve-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function denied() {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}

function imageOrigin(request) {
  if (process.env.NODE_ENV === "production") return SITE_URL;
  return requestOrigin(request);
}

async function handle(request, context) {
  const { platform, file } = await context.params;
  const slug = parseSocialImageFileName(file);
  if (!slug || !getSocialPlatform(platform)) return denied();

  return serveSocialJpeg({
    platformKey: platform,
    slug,
    origin: imageOrigin(request),
  });
}

export async function GET(request, context) {
  return handle(request, context);
}

export async function HEAD(request, context) {
  const response = await handle(request, context);
  return new NextResponse(null, {
    status: response.status,
    headers: response.headers,
  });
}
