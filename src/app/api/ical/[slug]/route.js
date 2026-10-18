import { NextResponse } from "next/server";
import { buildPropertyCalendar, icsFilename } from "@/lib/ical/buildIcs";
import { EXPORT_CACHE_SECONDS } from "@/lib/ical/constants";
import { loadPropertyCalendar, manualBlocksForExport } from "@/lib/inventory";
import { createSanityReadClient } from "@/lib/sanity/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROPERTY_QUERY = `
*[_type == "property" && (slug.current == $slug || _id == $slug) && !(_id in path("drafts.**"))][0]{
  _id,
  name,
  nameEn,
  "slug": slug.current
}
`;

export async function GET(_request, context) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return new NextResponse("Missing villa", { status: 400 });
    }

    const client = createSanityReadClient();
    const property = await client.fetch(PROPERTY_QUERY, { slug });
    if (!property?._id || !property.slug) {
      return new NextResponse("Calendar not found", { status: 404 });
    }

    const calendar = await loadPropertyCalendar(client, property._id);
    const body = buildPropertyCalendar({
      property,
      bookings: calendar.paidBookings,
      blocks: manualBlocksForExport(calendar.blockedDocs, calendar.paidBookings),
    });

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `inline; filename="${icsFilename(property.slug)}"`,
        "Cache-Control": `public, max-age=${EXPORT_CACHE_SECONDS}, must-revalidate`,
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (error) {
    console.error("[ical] export failed", error);
    return new NextResponse("Calendar unavailable", { status: 500 });
  }
}
