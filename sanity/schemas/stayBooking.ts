import { defineField, defineType } from "sanity";

export const PAYMENT_STATUSES = [
  { title: "Pending", value: "pending" },
  { title: "Paid", value: "paid" },
  { title: "Failed", value: "failed" },
  { title: "Refunded", value: "refunded" },
  { title: "Cancelled", value: "cancelled" },
];

export const BOOKING_SOURCES = [
  { title: "Web", value: "web" },
  { title: "Owner", value: "owner" },
  { title: "Manual", value: "manual" },
];

/**
 * Confirmed reservation ledger. Paid bookings block inventory in /api/availability.
 * Payment webhooks create or update these documents.
 */
export const stayBooking = defineType({
  name: "stayBooking",
  title: "Stay booking",
  type: "document",
  description:
    "Reservation ledger for one stay. Paid bookings block nights in the availability API and appear on the owner calendar.",
  groups: [
    { name: "stay", title: "Stay", default: true },
    { name: "guest", title: "Guest" },
    { name: "pricing", title: "Pricing" },
    { name: "payment", title: "Payment" },
  ],
  fields: [
    defineField({
      name: "confirmationCode",
      title: "Confirmation code",
      type: "string",
      group: "stay",
      description:
        "Public booking reference shown to guests and staff. Example: BH-A1B2C3D4.",
      validation: (Rule) => Rule.required().min(4),
    }),
    defineField({
      name: "property",
      title: "Property",
      type: "reference",
      group: "stay",
      description:
        "Bookable unit for this stay. Example: Villa 8 or Airport Suite 1.",
      to: [{ type: "property" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "checkIn",
      title: "Check in",
      type: "date",
      group: "stay",
      description: "Arrival date (first occupied night). Example: 2026-09-12.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "checkOut",
      title: "Check out",
      type: "date",
      group: "stay",
      description:
        "Departure date. This day stays available for the next arrival. Example: 2026-09-15 for a 3 night stay.",
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          const checkIn = context.document?.checkIn as string | undefined;
          if (!value || !checkIn) return true;
          return value > checkIn || "Check out must be after check in.";
        }),
    }),
    defineField({
      name: "nights",
      title: "Nights",
      type: "number",
      group: "stay",
      description:
        "Number of nights between check in and check out. Example: 3 for Sep 12 to Sep 15.",
      validation: (Rule) => Rule.integer().min(1),
    }),
    defineField({
      name: "guestCount",
      title: "Guest count (adults + children)",
      type: "number",
      group: "guest",
      description:
        "Total human guests for extra guest fee math. Pets are separate. Example: 4.",
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: "petsCount",
      title: "Pets",
      type: "number",
      group: "guest",
      description: "Number of pets traveling. Does not affect extra guest fees. Example: 1.",
      initialValue: 0,
      validation: (Rule) => Rule.integer().min(0),
    }),
    defineField({
      name: "guestName",
      title: "Guest name",
      type: "string",
      group: "guest",
      description: "Primary guest full name. Example: Maria Lopez.",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "guestEmail",
      title: "Guest email",
      type: "string",
      group: "guest",
      description: "Confirmation email address. Example: maria@example.com.",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "guestPhone",
      title: "Guest phone",
      type: "string",
      group: "guest",
      description: "Optional contact number with country code. Example: +506 8888 0000.",
    }),
    defineField({
      name: "pricing",
      title: "Pricing breakdown",
      type: "object",
      group: "pricing",
      description:
        "Frozen quote at booking time. Filled by checkout or the payment webhook.",
      fields: [
        defineField({
          name: "currency",
          title: "Currency",
          type: "string",
          description: "Currency code for this quote. Example: USD.",
          initialValue: "USD",
        }),
        defineField({
          name: "nightlySubtotal",
          title: "Nightly subtotal",
          type: "number",
          description:
            "Sum of nightly rates before extras, fees, and tax. Example: 360 for 3 nights at $120.",
        }),
        defineField({
          name: "extraGuestFees",
          title: "Extra guest fees",
          type: "number",
          description:
            "Total extra guest charges for the stay. Example: 160 for 2 extra guests × $40 × 2 nights.",
        }),
        defineField({
          name: "feeLines",
          title: "Fee line items",
          type: "array",
          description:
            "Frozen fee breakdown from checkout. Example: Cleaning fee 9%, Resort fee $25 per night.",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "feeId",
                  title: "Fee ID",
                  type: "string",
                }),
                defineField({
                  name: "title",
                  title: "Title",
                  type: "string",
                }),
                defineField({
                  name: "feeType",
                  title: "Fee type",
                  type: "string",
                  options: {
                    list: [
                      { title: "Percentage", value: "percentage" },
                      { title: "Flat", value: "flat" },
                    ],
                  },
                }),
                defineField({
                  name: "amount",
                  title: "Configured amount",
                  type: "number",
                }),
                defineField({
                  name: "application",
                  title: "Application",
                  type: "string",
                }),
                defineField({
                  name: "subtotal",
                  title: "Calculated subtotal",
                  type: "number",
                }),
              ],
              preview: {
                select: { title: "title", subtotal: "subtotal" },
                prepare({ title, subtotal }) {
                  return {
                    title: title || "Fee",
                    subtitle:
                      typeof subtotal === "number"
                        ? `$${subtotal.toLocaleString()}`
                        : undefined,
                  };
                },
              },
            },
          ],
        }),
        defineField({
          name: "feesTotal",
          title: "Fees total",
          type: "number",
          description: "Sum of all fee line items before tax.",
        }),
        defineField({
          name: "serviceFee",
          title: "Service fee (legacy)",
          type: "number",
          description:
            "Deprecated. Mirrors fees total for older reports. Example: 30.60.",
        }),
        defineField({
          name: "tax",
          title: "Tax",
          type: "number",
          description: "Tax amount from System Settings rate. Example: 50.70 at 13%.",
        }),
        defineField({
          name: "total",
          title: "Total",
          type: "number",
          description: "Amount charged to the guest. Example: 601.30.",
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: "nightlyRates",
          title: "Nightly rates (snapshot)",
          type: "array",
          description:
            "Per night rate snapshot used in the quote. Example row: date 2026-09-12, rate 120.",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "date",
                  title: "Date",
                  type: "date",
                  description: "Night date. Example: 2026-09-12.",
                }),
                defineField({
                  name: "rate",
                  title: "Rate",
                  type: "number",
                  description: "Nightly rate for that date. Example: 120.",
                }),
              ],
              preview: {
                select: { title: "date", subtitle: "rate" },
                prepare({ title, subtitle }) {
                  return {
                    title: title || "Night",
                    subtitle:
                      typeof subtitle === "number"
                        ? `$${subtitle.toLocaleString()}`
                        : undefined,
                  };
                },
              },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "paymentStatus",
      title: "Payment status",
      type: "string",
      group: "payment",
      description:
        "Only Paid blocks inventory. Example: pending before checkout, paid after webhook success.",
      options: { list: PAYMENT_STATUSES, layout: "radio" },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "paymentProvider",
      title: "Payment provider",
      type: "string",
      group: "payment",
      description: "Where the guest paid. Example: stripe for card checkout.",
      options: {
        list: [
          { title: "Stripe", value: "stripe" },
          { title: "PayPal", value: "paypal" },
          { title: "Tilopay / BAC", value: "tilopay" },
          { title: "Manual / bank", value: "manual" },
          { title: "None", value: "none" },
        ],
        layout: "dropdown",
      },
      initialValue: "none",
    }),
    defineField({
      name: "paymentIntentId",
      title: "Payment intent / charge ID",
      type: "string",
      group: "payment",
      description:
        "Provider reference for webhook idempotency. Example: pi_3OxYz... from Stripe.",
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      group: "payment",
      description:
        "How the booking was created. Example: web for guest checkout, manual for an owner entered stay.",
      options: { list: BOOKING_SOURCES, layout: "radio" },
      initialValue: "web",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "notes",
      title: "Internal notes",
      type: "text",
      rows: 3,
      group: "payment",
      description:
        "Staff only notes. Example: Late check in requested, key under mat for Villa 3.",
    }),
    defineField({
      name: "blockedDateRef",
      title: "Linked calendar block",
      type: "reference",
      group: "stay",
      to: [{ type: "blockedDate" }],
      weak: true,
      description:
        "Optional linked blocked date document. Usually created automatically when payment confirms.",
    }),
  ],
  orderings: [
    {
      title: "Check in (soonest)",
      name: "checkInAsc",
      by: [{ field: "checkIn", direction: "asc" }],
    },
    {
      title: "Newest first",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "guestName",
      code: "confirmationCode",
      checkIn: "checkIn",
      checkOut: "checkOut",
      status: "paymentStatus",
      propertyName: "property.name",
    },
    prepare({ title, code, checkIn, checkOut, status, propertyName }) {
      const dates =
        checkIn && checkOut ? `${checkIn} to ${checkOut}` : "No dates";
      return {
        title: title || code || "Booking",
        subtitle: [propertyName, dates, status, code].filter(Boolean).join(" · "),
      };
    },
  },
});
