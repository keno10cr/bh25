import { NextResponse } from "next/server";
import { createPendingStayBooking } from "@/lib/stayBooking";

export const runtime = "nodejs";

/**
 * Create a pending stayBooking before redirecting the guest to a payment provider.
 * On successful payment, POST /api/webhooks/payment marks it paid and blocks nights.
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
  } = body || {};

  if (!propertyId || !checkIn || !checkOut || !guestName || !guestEmail) {
    return NextResponse.json(
      { error: "Missing required booking fields." },
      { status: 400 }
    );
  }

  try {
    const booking = await createPendingStayBooking({
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

    return NextResponse.json({
      ok: true,
      id: booking._id,
      confirmationCode: booking.confirmationCode,
    });
  } catch (error) {
    console.error("[bookings/pending]", error);
    return NextResponse.json(
      { error: "Could not create pending booking." },
      { status: 500 }
    );
  }
}
