import { defineField, defineType } from "sanity";

export const systemSettings = defineType({
  name: "systemSettings",
  title: "System Settings",
  type: "document",
  description:
    "Global commercial knobs shared by every property: taxes, fees, listing tags, careers catalogs, and payment toggles. Keep API secrets in env vars, not here.",
  fields: [
    defineField({
      name: "taxRate",
      title: "Tax rate (%)",
      type: "number",
      description:
        "Percentage applied after service fees in checkout. Example: enter 13 for 13% Costa Rica IVA style tax.",
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0).max(100),
    }),
    defineField({
      name: "checkoutFeeCatalog",
      title: "Checkout fee catalog",
      type: "array",
      description:
        "Guest facing fees applied during checkout. Each row becomes a line item on the summary and booking record. Example: Cleaning fee at 9% per stay, or Resort fee at $25 per night.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "feeId",
              title: "Fee ID",
              type: "string",
              description:
                "Stable key for exports and reporting. Lowercase letters, numbers, and hyphens only. Example: cleaning-fee.",
              validation: (Rule) =>
                Rule.required().regex(/^[a-z0-9-]+$/, {
                  name: "slug",
                  invert: false,
                }),
            }),
            defineField({
              name: "title",
              title: "Title (English)",
              type: "string",
              description:
                "Guest facing English label on checkout. Example: Cleaning fee or Resort fee.",
              validation: (Rule) => Rule.required().min(2).max(80),
            }),
            defineField({
              name: "titleEs",
              title: "Title (Spanish)",
              type: "string",
              description: "Optional Spanish label. Example: Tarifa de limpieza.",
            }),
            defineField({
              name: "titleDe",
              title: "Title (German)",
              type: "string",
            }),
            defineField({
              name: "titleNl",
              title: "Title (Dutch)",
              type: "string",
            }),
            defineField({
              name: "titleFr",
              title: "Title (French)",
              type: "string",
            }),
            defineField({
              name: "titleJa",
              title: "Title (Japanese)",
              type: "string",
            }),
            defineField({
              name: "titlePt",
              title: "Title (Portuguese)",
              type: "string",
            }),
            defineField({
              name: "feeType",
              title: "Fee type",
              type: "string",
              options: {
                list: [
                  { title: "Percentage", value: "percentage" },
                  { title: "Flat amount", value: "flat" },
                ],
                layout: "radio",
              },
              initialValue: "percentage",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "amount",
              title: "Amount",
              type: "number",
              description:
                "Percentage value (example: 9 for 9%) or flat dollar amount (example: 25 for $25).",
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: "application",
              title: "Application",
              type: "string",
              description:
                "For flat fees: charge once per stay or multiply by nights. Percentage fees always apply to the stay subtotal once.",
              options: {
                list: [
                  { title: "Per stay", value: "perStay" },
                  { title: "Per night", value: "perNight" },
                ],
                layout: "radio",
              },
              initialValue: "perStay",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "title",
              feeType: "feeType",
              amount: "amount",
              application: "application",
            },
            prepare({ title, feeType, amount, application }) {
              const typeLabel =
                feeType === "flat"
                  ? `$${amount ?? 0} ${application === "perNight" ? "per night" : "per stay"}`
                  : `${amount ?? 0}%`;
              return {
                title: title || "Fee",
                subtitle: typeLabel,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "taxLabelEn",
      title: "Tax label (English)",
      type: "string",
      description:
        "Guest facing name on checkout for the tax line. Example: Tax or IVA.",
      initialValue: "Tax",
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: "currency",
      title: "Default currency",
      type: "string",
      description:
        "Default checkout currency when a property does not override it. Example: USD.",
      options: {
        list: [
          { title: "USD", value: "USD" },
          { title: "EUR", value: "EUR" },
          { title: "CRC", value: "CRC" },
        ],
        layout: "radio",
      },
      initialValue: "USD",
    }),
    defineField({
      name: "paymentsEnabled",
      title: "Online payments enabled",
      type: "boolean",
      initialValue: false,
      description:
        "Master switch for Reserve / pay online. When off, guests can still inquire. Wire Stripe secrets in .env, never in this document.",
    }),
    defineField({
      name: "paymentProviders",
      title: "Enabled payment providers",
      type: "array",
      description:
        "Which providers appear in checkout when payments are enabled. Example: Stripe only to start.",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Stripe", value: "stripe" },
          { title: "PayPal", value: "paypal" },
          { title: "Tilopay / BAC", value: "tilopay" },
        ],
      },
    }),
    defineField({
      name: "listingTagCatalog",
      title: "Property listing tags",
      type: "array",
      description:
        "Reusable tags for property cards. Properties pick these by Tag ID. Example row: tag ID new-listing, label New listing, code NL.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "tagId",
              title: "Tag ID",
              type: "string",
              description:
                "Stable key used on properties. Lowercase letters, numbers, and hyphens only. Example: new-listing.",
              validation: (Rule) =>
                Rule.required().regex(/^[a-z0-9-]+$/, {
                  name: "slug",
                  invert: false,
                }),
            }),
            defineField({
              name: "labelEn",
              title: "Label (English)",
              type: "string",
              description: "Guest facing English label. Example: New listing.",
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: "labelEs",
              title: "Label (Spanish)",
              type: "string",
              description: "Guest facing Spanish label. Example: Nuevo listado.",
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: "backgroundColor",
              title: "Background color",
              type: "string",
              description: "CSS color for the tag chip. Example: #166534.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "textColor",
              title: "Text color",
              type: "string",
              description: "CSS color for the tag label text. Example: #ffffff.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "tagCode",
              title: "Tag code (optional)",
              type: "string",
              description:
                "1 to 3 characters shown on compact cards before expand. Example: NL.",
              validation: (Rule) => Rule.max(3),
            }),
          ],
          preview: {
            select: { title: "labelEn", subtitle: "tagId", tagCode: "tagCode" },
            prepare({ title, subtitle, tagCode }) {
              return {
                title: tagCode ? `${tagCode} · ${title}` : title,
                subtitle,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "careersLocationCatalog",
      title: "Careers locations",
      type: "array",
      description:
        "Offices or meeting points for job postings. Usually one Blessed House address. Example: blessed-house-pv → Blessed House, Puerto Viejo.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "locationId",
              title: "Location ID",
              type: "string",
              description:
                "Stable key on job postings. Lowercase letters, numbers, and hyphens. Example: blessed-house-pv.",
              validation: (Rule) =>
                Rule.required().regex(/^[a-z0-9-]+$/, {
                  name: "slug",
                  invert: false,
                }),
            }),
            defineField({
              name: "labelEn",
              title: "Label (English)",
              type: "string",
              description:
                "English label on the careers page. Example: Blessed House, Puerto Viejo.",
              validation: (Rule) => Rule.required().min(2),
            }),
            defineField({
              name: "labelEs",
              title: "Label (Spanish)",
              type: "string",
              description:
                "Optional Spanish label. Example: Blessed House, Puerto Viejo. Falls back to English when empty.",
            }),
            defineField({
              name: "coordinates",
              title: "Coordinates",
              type: "geopoint",
              description:
                "Optional map pin for filtering or future maps. Example: drag onto the lodge entrance.",
            }),
            defineField({
              name: "notes",
              title: "Internal notes",
              type: "text",
              rows: 2,
              description:
                "Editor reminder only. Example: Primary interview location, ask for reception.",
            }),
          ],
          preview: {
            select: { title: "labelEn", subtitle: "locationId" },
            prepare({ title, subtitle }) {
              return { title: title || "Location", subtitle };
            },
          },
        },
      ],
    }),
    defineField({
      name: "jobListingTagCatalog",
      title: "Job listing tags",
      type: "array",
      description:
        "Tags for job postings. Jobs reference these by Tag ID. Example: urgent with a red chip.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "tagId",
              title: "Tag ID",
              type: "string",
              description:
                "Stable key on job postings. Example: new or urgent.",
              validation: (Rule) =>
                Rule.required().regex(/^[a-z0-9-]+$/, {
                  name: "slug",
                  invert: false,
                }),
            }),
            defineField({
              name: "labelEn",
              title: "Label (English)",
              type: "string",
              description: "English chip label. Example: Urgent.",
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: "labelEs",
              title: "Label (Spanish)",
              type: "string",
              description: "Optional Spanish chip label. Example: Urgente.",
            }),
            defineField({
              name: "backgroundColor",
              title: "Background color",
              type: "string",
              description: "CSS color for the chip. Example: #9a3412.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "textColor",
              title: "Text color",
              type: "string",
              description: "CSS color for the chip text. Example: #ffffff.",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "labelEn", subtitle: "tagId" },
            prepare({ title, subtitle }) {
              return { title: title || "Tag", subtitle };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "System Settings",
        subtitle: "Taxes, fees, tags, payments, careers catalogs",
      };
    },
  },
});
