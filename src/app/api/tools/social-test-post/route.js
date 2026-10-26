import { NextResponse } from "next/server";
import { isToolRequestAuthorized } from "@/lib/toolAuth";
import { loadSocialPost } from "@/lib/social/load-post";
import { buildSocialPack } from "@/lib/social/pack";
import { webhookPayloadFor } from "@/lib/social/check";
import { SITE_URL } from "@/lib/siteMetadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAKE_TIMEOUT_MS = 15000;

/**
 * Sends the same payload the Sanity webhook sends, plus `is_test: true`, so the
 * Make.com scenario can run end to end and skip the posting modules.
 * Image links always point at the live site because Make.com cannot reach localhost.
 */
export async function POST(request) {
  if (!(await isToolRequestAuthorized(request))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const webhookUrl = process.env.MAKE_BLOG_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "MAKE_BLOG_WEBHOOK_URL is not set on this server." },
      { status: 503 }
    );
  }

  let slug = "";
  try {
    ({ slug = "" } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  slug = String(slug).trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing blog post." }, { status: 400 });
  }

  const post = await loadSocialPost(slug);
  const pack = post ? buildSocialPack({ post, origin: SITE_URL }) : null;
  if (!pack) {
    return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
  }

  const sentAt = new Date().toISOString();
  const payload = {
    ...webhookPayloadFor(pack, SITE_URL),
    is_test: true,
    sentFrom: "tools/social",
    sentAt,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MAKE_TIMEOUT_MS);
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });
    const reply = (await response.text()).slice(0, 300);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Make.com replied with HTTP ${response.status}.`, reply, payload },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, status: response.status, reply, sentAt, payload });
  } catch (error) {
    const message =
      error?.name === "AbortError" ? "Make.com did not answer within 15 seconds." : "Could not reach Make.com.";
    console.error("[social-test-post]", error?.message || error);
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
