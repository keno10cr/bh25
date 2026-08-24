import { NextResponse } from "next/server";
import { confirmPaidStayBooking } from "@/lib/stayBooking";
import { createSanityReadClient } from "@/lib/sanity/client";

export const runtime = "nodejs";

/**
 * Payment webhook foundation (Stripe Checkout / PaymentIntents style).
 *
 * Env (never store secrets in Sanity System Settings):
 * - STRIPE_WEBHOOK_SECRET
 * - STRIPE_SECRET_KEY (for Checkout / PaymentIntents creation elsewhere)
 * - SANITY_API_WRITE_TOKEN
 *
 * Pass stay metadata on the PaymentIntent / Checkout Session:
 * stayBookingId, propertyId, checkIn, checkOut, guestName, guestEmail,
 * guestPhone, guestCount, petsCount, nights, pricingTotal, currency, source.
 *
 * Local smoke test (development only):
 *   Header: x-bh-webhook-dev: 1
 *   Body: { "event": "payment_intent.succeeded", "paymentIntentId": "pi_test", "metadata": { ... } }
 */
function verifyStripeSignature(rawBody, signatureHeader, secret) {
  // Integration point: replace with stripe.webhooks.constructEvent after
  // adding the `stripe` package. Kept explicit so the seam is obvious.
  if (!secret || !signatureHeader || !rawBody) return null;
  return {
    ok: false,
    reason:
      "Stripe SDK not installed yet. Wire stripe.webhooks.constructEvent here.",
  };
}

async function findBookingByPaymentIntent(paymentIntentId) {
  if (!paymentIntentId) return null;
  const client = createSanityReadClient();
  return client.fetch(
    `*[_type == "stayBooking" && paymentIntentId == $pid][0]{_id, paymentStatus}`,
    { pid: paymentIntentId }
  );
}

async function handlePaymentSucceeded({
  paymentIntentId,
  metadata = {},
  pricing,
  paymentProvider = "stripe",
}) {
  const existing = await findBookingByPaymentIntent(paymentIntentId);
  if (existing?.paymentStatus === "paid") {
    return { ok: true, idempotent: true, id: existing._id };
  }

  const booking = await confirmPaidStayBooking({
    existingBookingId: metadata.stayBookingId || existing?._id,
    propertyId: metadata.propertyId,
    checkIn: metadata.checkIn,
    checkOut: metadata.checkOut,
    guestName: metadata.guestName,
    guestEmail: metadata.guestEmail,
    guestPhone: metadata.guestPhone,
    guestCount: Number(metadata.guestCount) || 1,
    petsCount: Number(metadata.petsCount) || 0,
    nights: Number(metadata.nights) || undefined,
    pricing: pricing || {
      currency: metadata.currency || "USD",
      total: Number(metadata.pricingTotal) || 0,
    },
    paymentProvider,
    paymentIntentId,
    source: metadata.source || "web",
    confirmationCode: metadata.confirmationCode,
  });

  return { ok: true, id: booking._id };
}

export async function POST(request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const isDevBypass =
    process.env.NODE_ENV !== "production" &&
    request.headers.get("x-bh-webhook-dev") === "1";

  const rawBody = await request.text();

  let eventName;
  let paymentIntentId;
  let metadata = {};
  let pricing;

  if (isDevBypass) {
    try {
      const body = JSON.parse(rawBody || "{}");
      eventName = body.event || "payment_intent.succeeded";
      paymentIntentId = body.paymentIntentId;
      metadata = body.metadata || {};
      pricing = body.pricing;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  } else if (webhookSecret) {
    const verified = verifyStripeSignature(rawBody, signature, webhookSecret);
    if (!verified || verified.ok === false) {
      return NextResponse.json(
        {
          error:
            verified?.reason ||
            "Webhook signature verification is not fully wired. Install stripe and constructEvent.",
        },
        { status: 501 }
      );
    }
    eventName = verified.event?.type;
    paymentIntentId = verified.event?.data?.object?.id;
    metadata = verified.event?.data?.object?.metadata || {};
  } else {
    return NextResponse.json(
      {
        error:
          "Payment webhooks are not configured. Set STRIPE_WEBHOOK_SECRET (and install stripe) or use the local x-bh-webhook-dev header in development.",
      },
      { status: 503 }
    );
  }

  try {
    if (
      eventName === "payment_intent.succeeded" ||
      eventName === "checkout.session.completed"
    ) {
      const result = await handlePaymentSucceeded({
        paymentIntentId,
        metadata,
        pricing,
        paymentProvider: "stripe",
      });
      return NextResponse.json(result);
    }

    if (
      eventName === "payment_intent.payment_failed" ||
      eventName === "checkout.session.expired"
    ) {
      if (metadata.stayBookingId) {
        const { createSanityServerClient } = await import("@/lib/sanity/client");
        const client = createSanityServerClient();
        await client
          .patch(metadata.stayBookingId)
          .set({ paymentStatus: "failed" })
          .commit();
      }
      return NextResponse.json({ ok: true, ignored: false, status: "failed" });
    }

    return NextResponse.json({ ok: true, ignored: true, event: eventName });
  } catch (error) {
    console.error("[webhooks/payment]", error);
    return NextResponse.json(
      { error: "Failed to process payment webhook" },
      { status: 500 }
    );
  }
}
