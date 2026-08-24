import { createSanityServerClient } from "@/lib/sanity/client";
import { occupiedNightsFromStay } from "@/lib/availabilityDates";

const PAID_STATUSES = new Set(["paid"]);

/**
 * Creates or updates a stayBooking after a successful payment webhook,
 * and creates a linked blockedDate so the calendar stays consistent for owners.
 */
export async function confirmPaidStayBooking({
  existingBookingId,
  propertyId,
  checkIn,
  checkOut,
  guestName,
  guestEmail,
  guestPhone,
  guestCount,
  petsCount = 0,
  nights,
  pricing,
  paymentProvider = "stripe",
  paymentIntentId,
  source = "web",
  confirmationCode,
}) {
  const client = createSanityServerClient();
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  }

  const code =
    confirmationCode ||
    `BH-${(paymentIntentId || Date.now().toString(36)).slice(-8).toUpperCase()}`;

  const blockTitle = `Booking ${code}`;
  const occupied = occupiedNightsFromStay(checkIn, checkOut);
  const blockEnd = occupied.length
    ? occupied[occupied.length - 1]
    : checkIn;

  let blockedDateId = null;
  if (propertyId && checkIn && checkOut) {
    const blockDoc = await client.create({
      _type: "blockedDate",
      title: blockTitle,
      startDate: checkIn,
      endDate: blockEnd,
      property: { _type: "reference", _ref: propertyId },
      reason: "external",
    });
    blockedDateId = blockDoc._id;
  }

  const payload = {
    _type: "stayBooking",
    confirmationCode: code,
    property: propertyId
      ? { _type: "reference", _ref: propertyId }
      : undefined,
    checkIn,
    checkOut,
    nights: nights || occupied.length || undefined,
    guestCount,
    petsCount,
    guestName,
    guestEmail,
    guestPhone,
    pricing,
    paymentStatus: "paid",
    paymentProvider,
    paymentIntentId,
    source,
    blockedDateRef: blockedDateId
      ? { _type: "reference", _ref: blockedDateId, _weak: true }
      : undefined,
  };

  if (existingBookingId) {
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined)
    );
    return client.patch(existingBookingId).set(cleaned).commit();
  }

  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );
  return client.create(cleaned);
}

export async function createPendingStayBooking(fields) {
  const client = createSanityServerClient();
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  }

  return client.create({
    _type: "stayBooking",
    confirmationCode:
      fields.confirmationCode ||
      `BH-P-${Date.now().toString(36).toUpperCase()}`,
    property: { _type: "reference", _ref: fields.propertyId },
    checkIn: fields.checkIn,
    checkOut: fields.checkOut,
    nights: fields.nights,
    guestCount: fields.guestCount,
    petsCount: fields.petsCount || 0,
    guestName: fields.guestName,
    guestEmail: fields.guestEmail,
    guestPhone: fields.guestPhone,
    pricing: fields.pricing,
    paymentStatus: "pending",
    paymentProvider: fields.paymentProvider || "stripe",
    paymentIntentId: fields.paymentIntentId,
    source: fields.source || "web",
  });
}

export function isInventoryBlockingStatus(paymentStatus) {
  return PAID_STATUSES.has(paymentStatus);
}
