import { defineArrayMember, defineField, defineType } from "sanity";

export const GROUP_QUOTE_STATUSES = [
  { title: "Sent", value: "sent" },
  { title: "Accepted", value: "accepted" },
  { title: "Lost", value: "lost" },
];

const readOnly = true;

const money = (name: string, title: string, group = "pricing") =>
  defineField({ name, title, type: "number", readOnly, group, description: "USD" });

export const groupQuote = defineType({
  name: "groupQuote",
  title: "Group quote",
  type: "document",
  description: "Logged automatically every time a PDF is downloaded from /bhgr.",
  groups: [
    { name: "overview", title: "Overview", default: true },
    { name: "pricing", title: "Pricing" },
    { name: "settings", title: "PDF settings" },
  ],
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "overview",
      initialValue: "sent",
      options: { list: GROUP_QUOTE_STATUSES, layout: "radio", direction: "horizontal" },
    }),
    defineField({
      name: "internalNotes",
      title: "Internal notes",
      type: "text",
      rows: 3,
      group: "overview",
      description: "Only visible here. Not shown on the PDF.",
    }),
    defineField({ name: "quoteNumber", title: "Quote number", type: "string", readOnly, group: "overview" }),
    defineField({ name: "groupName", title: "Group name", type: "string", readOnly, group: "overview" }),
    defineField({ name: "contactName", title: "Contact name", type: "string", readOnly, group: "overview" }),
    defineField({ name: "createdAt", title: "First downloaded", type: "datetime", readOnly, group: "overview" }),
    defineField({ name: "lastDownloadedAt", title: "Last downloaded", type: "datetime", readOnly, group: "overview" }),
    defineField({ name: "downloads", title: "Downloads", type: "number", readOnly, group: "overview" }),
    defineField({ name: "checkIn", title: "Check in", type: "date", readOnly, group: "overview" }),
    defineField({ name: "checkOut", title: "Check out", type: "date", readOnly, group: "overview" }),
    defineField({ name: "nights", title: "Nights", type: "number", readOnly, group: "overview" }),
    defineField({ name: "totalGuests", title: "Total guests", type: "number", readOnly, group: "overview" }),
    defineField({ name: "validUntil", title: "Valid until", type: "date", readOnly, group: "overview" }),
    defineField({
      name: "villas",
      title: "Villas",
      type: "array",
      readOnly,
      group: "overview",
      of: [
        defineArrayMember({
          type: "object",
          name: "quotedVilla",
          fields: [
            defineField({ name: "name", title: "Villa", type: "string" }),
            defineField({ name: "guests", title: "Guests", type: "number" }),
            defineField({ name: "checkIn", title: "Check in", type: "date" }),
            defineField({ name: "checkOut", title: "Check out", type: "date" }),
            defineField({ name: "nights", title: "Nights", type: "number" }),
            defineField({ name: "subtotal", title: "Subtotal (USD)", type: "number" }),
            defineField({
              name: "exceptions",
              title: "Special exceptions",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
            }),
          ],
          preview: {
            select: { name: "name", guests: "guests", nights: "nights", subtotal: "subtotal" },
            prepare({ name, guests, nights, subtotal }) {
              return {
                title: name,
                subtitle: [
                  guests ? `${guests} guests` : "",
                  nights ? `${nights} nights` : "",
                  subtotal != null ? `$${subtotal}` : "",
                ]
                  .filter(Boolean)
                  .join(" · "),
              };
            },
          },
        }),
      ],
    }),
    defineField({ name: "quoteNotes", title: "Notes on the PDF", type: "text", rows: 3, readOnly, group: "overview" }),

    money("total", "Total"),
    money("subtotal", "Accommodation before discount"),
    defineField({ name: "discountLabel", title: "Discount", type: "string", readOnly, group: "pricing" }),
    money("discountAmount", "Discount amount"),
    money("addOnsTotal", "Meals and services total"),
    defineField({
      name: "addOns",
      title: "Meals and services",
      type: "array",
      readOnly,
      group: "pricing",
      of: [
        defineArrayMember({
          type: "object",
          name: "quotedAddOn",
          fields: [
            defineField({ name: "name", title: "Item", type: "string" }),
            defineField({ name: "category", title: "Category", type: "string" }),
            defineField({ name: "unitPriceUsd", title: "Unit price (USD)", type: "number" }),
            defineField({ name: "people", title: "People", type: "number" }),
            defineField({ name: "units", title: "Days or units", type: "number" }),
            defineField({ name: "total", title: "Total (USD)", type: "number" }),
          ],
          preview: {
            select: { name: "name", total: "total", people: "people", units: "units" },
            prepare({ name, total, people, units }) {
              return {
                title: name || "Item",
                subtitle: `${people} × ${units} · $${total}`,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "fees",
      title: "Fees",
      type: "array",
      readOnly,
      group: "pricing",
      of: [
        defineArrayMember({
          type: "object",
          name: "quotedFee",
          fields: [
            defineField({ name: "title", title: "Fee", type: "string" }),
            defineField({ name: "amount", title: "Amount (USD)", type: "number" }),
          ],
          preview: {
            select: { title: "title", amount: "amount" },
            prepare({ title, amount }) {
              return { title, subtitle: `$${amount}` };
            },
          },
        }),
      ],
    }),
    defineField({ name: "taxRate", title: "Tax rate (%)", type: "number", readOnly, group: "pricing" }),
    money("taxes", "Tax"),

    defineField({ name: "language", title: "PDF language", type: "string", readOnly, group: "settings" }),
    defineField({ name: "currency", title: "Currency shown", type: "string", readOnly, group: "settings" }),
    defineField({ name: "exchangeRate", title: "Exchange rate (CRC per USD)", type: "number", readOnly, group: "settings" }),
    defineField({ name: "phone", title: "Phone on the PDF", type: "string", readOnly, group: "settings" }),
    defineField({ name: "priceDisplay", title: "Price display", type: "string", readOnly, group: "settings" }),
    defineField({ name: "rateDetail", title: "Rate detail", type: "string", readOnly, group: "settings" }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      groupName: "groupName",
      quoteNumber: "quoteNumber",
      villas: "villas",
      totalGuests: "totalGuests",
      total: "total",
      createdAt: "createdAt",
      status: "status",
    },
    prepare({ groupName, quoteNumber, villas, totalGuests, total, createdAt, status }) {
      const villaCount = Array.isArray(villas) ? villas.length : 0;
      const statusLabel =
        GROUP_QUOTE_STATUSES.find((item) => item.value === status)?.title || "Sent";
      return {
        title: groupName || "Unnamed group",
        subtitle: [
          villaCount ? `${villaCount} ${villaCount === 1 ? "villa" : "villas"}` : "",
          totalGuests ? `${totalGuests} guests` : "",
          total != null
            ? `$${Number(total).toLocaleString("en-US", { maximumFractionDigits: 2 })}`
            : "",
          createdAt ? new Date(createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
          statusLabel,
        ]
          .filter(Boolean)
          .join(" · "),
        description: quoteNumber,
      };
    },
  },
});
