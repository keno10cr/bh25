import { NextResponse } from "next/server";
import { buildCaptionPatch, galleryFromRequest } from "@/lib/property-caption-sync";
import { isCaptionTranslator } from "@/lib/sanity/studio-auth";

export const runtime = "nodejs";
export const maxDuration = 60;

function bearerToken(request) {
  const header = request.headers.get("authorization") || "";
  if (!header.toLowerCase().startsWith("bearer ")) return "";
  return header.slice(7).trim();
}

/**
 * Translate the open property's English captions.
 * The Studio button sends the user's Sanity token and then writes the
 * returned fields itself. This route does not write to Sanity.
 */
export async function POST(request) {
  const token = bearerToken(request);
  if (!(await isCaptionTranslator(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let doc;
  try {
    doc = galleryFromRequest(body);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const result = await buildCaptionPatch(doc, {});
    return NextResponse.json({
      ok: true,
      set: result.set,
      translated: result.translated,
      skipped: result.skipped,
      examined: result.examined,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
