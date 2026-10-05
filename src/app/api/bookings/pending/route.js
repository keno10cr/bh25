import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createPendingStayBooking } from "@/lib/stayBooking";
import { createSanityServerClient } from "@/lib/sanity/client";

export const runtime = "nodejs";

const NOTIFY_TO = [
  "blessedhousecr@gmail.com",
  "kervinbb95@gmail.com",
  "keno10cr@gmail.com",
];

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function formatMoney(amount, currency = "USD") {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

async function getPropertyName(propertyId) {
  try {
    const client = createSanityServerClient();
    const property = await client.fetch(
      `*[_id == $id][0]{ "name": coalesce(name, title), "slug": slug.current }`,
      { id: propertyId }
    );
    return property || {};
  } catch (error) {
    console.error("[bookings/pending] property lookup failed", error);
    return {};
  }
}

async function notifyTeam(details) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing; booking request email not sent.");
    return;
  }

  const rows = [
    ["Property", details.propertyName],
    ["Check in", details.checkIn],
    ["Check out", details.checkOut],
    ["Nights", details.nights],
    ["Guests", details.guestCount],
    ["Pets", details.petsCount],
    ["Estimated total", details.total],
    ["Confirmation code", details.confirmationCode],
    ["Guest name", details.guestName],
    ["Guest email", details.guestEmail],
    ["Guest phone", details.guestPhone],
    ["Language", details.language],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "Blessed House Villas <noreply@blessedhouse.info>",
    to: NOTIFY_TO,
    reply_to: details.guestEmail,
    subject: `Booking Request: ${details.propertyName || "Villa"} (${details.checkIn} to ${details.checkOut})`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
        <h2 style="color: #0a4c3a;">New booking request from the website</h2>
        <p>No payment was taken. Please confirm availability with the guest within 24 hours.</p>
        <table style="border-collapse: collapse;">
          ${rows
            .map(
              ([label, value]) =>
                `<tr><td style="padding: 4px 16px 4px 0; color: #667066;">${escapeHtml(label)}</td><td style="padding: 4px 0;"><strong>${escapeHtml(value)}</strong></td></tr>`
            )
            .join("")}
        </table>
      </div>
    `,
    text: [
      "New booking request from the website",
      "No payment was taken. Please confirm availability with the guest within 24 hours.",
      "",
      ...rows.map(([label, value]) => `${label}: ${value}`),
    ].join("\n"),
  });
}

/**
 * Create a pending stayBooking request. Guests do not pay online yet;
 * the team is notified by email and confirms availability within 24 hours.
 */
export async function POST(request) {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Server is not configured to create bookings." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    propertyId,
    checkIn,
    checkOut,
    guestName,
    guestEmail,
    guestPhone,
    guestCount,
    petsCount,
    nights,
    pricing,
    paymentProvider,
    paymentIntentId,
    source,
    confirmationCode,
    language,
  } = body || {};

  if (!propertyId || !checkIn || !checkOut || !guestName || !guestEmail) {
    return NextResponse.json(
      { error: "Missing required booking fields." },
      { status: 400 }
    );
  }

  let booking;
  try {
    booking = await createPendingStayBooking({
      propertyId,
      checkIn,
      checkOut,
      guestName,
      guestEmail,
      guestPhone,
      guestCount: Number(guestCount) || 1,
      petsCount: Number(petsCount) || 0,
      nights,
      pricing,
      paymentProvider,
      paymentIntentId,
      source,
      confirmationCode,
    });
  } catch (error) {
    console.error("[bookings/pending]", error);
    return NextResponse.json(
      { error: "Could not create pending booking." },
      { status: 500 }
    );
  }

  try {
    const property = await getPropertyName(propertyId);
    await notifyTeam({
      propertyName: property.name || propertyId,
      checkIn,
      checkOut,
      nights,
      guestCount: Number(guestCount) || 1,
      petsCount: Number(petsCount) || 0,
      total: formatMoney(pricing?.total, pricing?.currency),
      confirmationCode: booking.confirmationCode,
      guestName,
      guestEmail,
      guestPhone,
      language,
    });
  } catch (error) {
    console.error("[bookings/pending] booking saved but email failed", error);
  }

  return NextResponse.json({
    ok: true,
    id: booking._id,
    confirmationCode: booking.confirmationCode,
  });
}
