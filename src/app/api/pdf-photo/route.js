import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_HOST = "cdn.sanity.io";

export async function GET(request) {
  const src = new URL(request.url).searchParams.get("src") || "";
  let target;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ error: "bad url" }, { status: 400 });
  }

  if (target.protocol !== "https:" || target.hostname !== ALLOWED_HOST) {
    return NextResponse.json({ error: "forbidden" }, { status: 400 });
  }

  const upstream = await fetch(target.href, { redirect: "error" });
  if (!upstream.ok) {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }

  const bytes = await upstream.arrayBuffer();
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
