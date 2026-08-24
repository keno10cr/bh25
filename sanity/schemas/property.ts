import { defineArrayMember, defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";

const LISTING_TAG_CATALOG_QUERY = `*[_type == "systemSettings"][0].listingTagCatalog[]{tagId}`;

export const property = defineType({
  name: "property",
  title: "Property",
  type: "document",
  description:
    "One bookable unit (villa, room, or suite). For Blessed House, map every unit to the same hotel location.",
  fieldsets: [i18nFieldset],
  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "pricing", title: "Pricing" },
    { name: "sleeping", title: "Sleeping" },
    { name: "rules", title: "House rules" },
    { name: "media", title: "Media" },
    { name: "map", title: "Map" },
  ],
  fields: [
    ...localizedField({
      name: "name",
      title: "Name",
      type: "string",
      group: "basics",
      description:
        "Public listing name shown on cards and the detail page. Example: Villa 8 or Airport Suite 1.",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "basics",
      description:
        "URL path for this unit. Keep it lowercase. Example: villa-8 or airport-suite-1.",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "propertyKind",
      title: "Type of property",
      type: "reference",
      group: "basics",
      description:
        "Choose from Catalog → Property types. Example: Villa, Room, or Suite.",
      to: [{ type: "propertyKind" }],
    }),
    defineField({
      name: "locationRef",
      title: "Location",
      type: "reference",
      group: "basics",
      description:
        "Central hotel location document. Example: Blessed House (same location for every room on site).",
      to: [{ type: "location" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "regionEn",
      title: "Region / country (English)",
      type: "string",
      group: "basics",
      description:
        "Broader region shown next to the location on English pages. Example: Costa Rica.",
      initialValue: "Costa Rica",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "regionEs",
      title: "Region / country (Spanish)",
      type: "string",
      group: "basics",
      description:
        "Optional Spanish region label. Example: Costa Rica. Falls back to English when empty.",
    }),
    ...localizedField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
      group: "basics",
      description:
        "1 to 2 sentence card summary for listings and SEO. Example: Private jungle villa with a king bed, porch hammock, and shared pool access.",
      validation: (Rule) => Rule.max(260),
    }),
    ...localizedField({
      name: "description",
      title: "Full description",
      type: "blockContent",
      group: "basics",
      description:
        "Long form detail page copy. Include sleeping layout, shared spaces, and what makes this unit unique.",
    }),
    defineField({
      name: "priceMin",
      title: "Price per night (min)",
      type: "number",
      group: "pricing",
      description:
        "Low season starting nightly rate in this property currency. Example: 120 for $120 / night.",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "priceMax",
      title: "Price per night (max)",
      type: "number",
      group: "pricing",
      description:
        "High season maximum nightly rate. Example: 180. Must be greater than or equal to the min price.",
      validation: (Rule) =>
        Rule.required()
          .positive()
          .custom((value, context) => {
            const min =
              (context.document?.priceMin as number | undefined) ?? 0;
            if (typeof value !== "number") return true;
            return (
              value >= min || "Max price must be greater than or equal to min price."
            );
          }),
    }),
    defineField({
      name: "seasonalPricing",
      title: "Seasonal pricing",
      type: "array",
      group: "pricing",
      description:
        "Optional date range rate overrides. When no season matches a night, the midpoint of min/max is used. Example: Carnival week from 2027-02-10 to 2027-02-17 at $220 / night.",
      of: [
        defineField({
          name: "season",
          title: "Season",
          type: "object",
          fields: [
            defineField({
              name: "titleEn",
              title: "Title (English)",
              type: "string",
              description: "Short label for editors and quotes. Example: High season December.",
              validation: (Rule) => Rule.max(120),
            }),
            defineField({
              name: "titleEs",
              title: "Title (Spanish)",
              type: "string",
              description: "Spanish label for the same season. Example: Temporada alta diciembre.",
              validation: (Rule) => Rule.max(120),
            }),
            defineField({
              name: "startDate",
              title: "Start date",
              type: "date",
              description: "First night this seasonal rate applies. Example: 2026-12-15.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "endDate",
              title: "End date",
              type: "date",
              description: "Last night this seasonal rate applies. Example: 2027-01-05.",
              validation: (Rule) =>
                Rule.required().custom((value, context) => {
                  const parent = (context.parent ?? {}) as {
                    startDate?: string;
                  };
                  const startDate = parent.startDate;
                  if (!value || !startDate) return true;
                  return (
                    value >= startDate || "End date must be on or after start date."
                  );
                }),
            }),
            defineField({
              name: "price",
              title: "Price per night",
              type: "number",
              description: "Nightly rate for every night in this range. Example: 220.",
              validation: (Rule) => Rule.required().positive(),
            }),
          ],
          preview: {
            select: {
              titleEn: "titleEn",
              startDate: "startDate",
              endDate: "endDate",
              price: "price",
            },
            prepare({ titleEn, startDate, endDate, price }) {
              return {
                title:
                  titleEn?.trim() ||
                  `${startDate || "No start"} to ${endDate || "No end"}`,
                subtitle:
                  typeof price === "number"
                    ? `$${price.toLocaleString()} / night`
                    : "No price set",
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      group: "pricing",
      description: "Currency for displayed rates and quotes. Example: USD.",
      options: {
        list: [
          { title: "USD", value: "USD" },
          { title: "EUR", value: "EUR" },
          { title: "CRC", value: "CRC" },
        ],
        layout: "radio",
      },
      initialValue: "USD",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "minimumNights",
      title: "Minimum stay (nights)",
      type: "number",
      group: "pricing",
      initialValue: 2,
      description:
        "Shortest stay guests can Reserve online. Example: 2. Inquire can still allow shorter stays. Leave empty to allow 1 night.",
      validation: (Rule) => Rule.integer().min(1).max(365),
    }),
    defineField({
      name: "baseGuestCount",
      title: "Base guest count (included in nightly rate)",
      type: "number",
      group: "pricing",
      description:
        "Adults and children included in the nightly rate. Pets never count. Example: 2 included on a room that sleeps 4. Leave empty to include everyone up to capacity.",
      validation: (Rule) => Rule.integer().min(1),
    }),
    defineField({
      name: "extraGuestFeePerNight",
      title: "Extra guest fee (per person, per night)",
      type: "number",
      group: "pricing",
      description:
        "USD (or property currency) charged per extra adult/child above the base count, per night. Example: 40. Leave empty or 0 for no extra guest charges.",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "bathrooms",
      title: "Bathrooms",
      type: "number",
      group: "sleeping",
      description: "Total bathrooms for this unit. Fractional counts are OK. Example: 1 or 1.5.",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "petsMax",
      title: "Pets (maximum)",
      type: "number",
      group: "sleeping",
      description: "Maximum pets allowed. Use 0 if pets are not allowed. Example: 1.",
      initialValue: 0,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: "houseArrangements",
      title: "House arrangements",
      type: "array",
      group: "sleeping",
      description:
        "Sleeping spaces for this unit. Guest capacity = sum of (room type sleeps × quantity). Bedroom count = sum of quantities. Example for a 4 guest suite: 1 × Master Suite (sleeps 2) + 1 × Twin room (sleeps 2).",
      options: { layout: "list" },
      of: [
        defineArrayMember({
          type: "object",
          name: "houseArrangementRow",
          title: "Arrangement",
          fields: [
            defineField({
              name: "roomType",
              title: "Room / space type",
              type: "reference",
              description:
                "Pick from Catalog → Room / space types. Example: Master Suite or Twin Bedroom.",
              to: [{ type: "roomType" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "quantity",
              title: "Quantity",
              type: "number",
              description:
                "How many of this space exist in the unit. Example: 2 identical guest bedrooms → quantity 2.",
              initialValue: 1,
              validation: (Rule) => Rule.required().integer().min(1),
            }),
            defineField({
              name: "customTitleEn",
              title: "Custom title (English)",
              type: "string",
              description:
                "Optional override for this property only. Example: Honeymoon Suite instead of Master Suite.",
            }),
            defineField({
              name: "customTitleEs",
              title: "Custom title (Spanish)",
              type: "string",
              description:
                "Optional Spanish override for the display title. Example: Suite nupcial.",
            }),
          ],
          preview: {
            select: {
              qty: "quantity",
              customEn: "customTitleEn",
              roomTitle: "roomType.titleEn",
              capacity: "roomType.capacity",
            },
            prepare({ qty, customEn, roomTitle, capacity }) {
              const base = (customEn || roomTitle || "Space").trim();
              const q = typeof qty === "number" && qty > 1 ? `${qty} × ` : "";
              return {
                title: `${q}${base}`,
                subtitle:
                  typeof capacity === "number" ? `Sleeps ${capacity} each` : undefined,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "amenities",
      title: "Amenities",
      type: "array",
      group: "basics",
      description:
        "Simple amenity tags for cards and filters. Example: WiFi, Kitchenette, Air conditioning, Shared pool.",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "listingTags",
      title: "Listing tags",
      type: "array",
      group: "basics",
      description:
        "Up to 3 tag IDs from System Settings → Property listing tags. Example: new-listing. Define tags in System Settings first.",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) =>
        Rule.max(3)
          .unique()
          .custom(async (values, context) => {
            if (!Array.isArray(values) || values.length === 0) return true;
            const client = context.getClient({ apiVersion: "2025-08-01" });
            const catalog =
              (await client.fetch(LISTING_TAG_CATALOG_QUERY)) ?? [];
            const allowed = new Set(
              catalog
                .map((row) =>
                  typeof row?.tagId === "string" ? row.tagId.trim() : ""
                )
                .filter(Boolean)
            );
            if (allowed.size === 0) {
              return "Add tags in System Settings → Property listing tags before assigning them.";
            }
            const invalid = values.filter(
              (v) => typeof v === "string" && !allowed.has(v.trim())
            );
            if (invalid.length) {
              return `Unknown tag id(s): ${invalid.join(", ")}.`;
            }
            return true;
          }),
    }),
    defineField({
      name: "houseRulesAreaRules",
      title: "House rules (area sections)",
      type: "array",
      group: "rules",
      description:
        "Checkout Step 2 sections. Example: Shared pool care, Quiet hours, Early flight checkout.",
      of: [
        defineField({
          name: "areaRule",
          title: "Area rule",
          type: "object",
          fields: [
            defineField({
              name: "titleEn",
              title: "Title",
              type: "string",
              description: "Section heading. Example: Shared pool area.",
              validation: (Rule) => Rule.required().min(2),
            }),
            defineField({
              name: "bodyEn",
              title: "Body",
              type: "blockContent",
              description:
                "Rule details shown in checkout. Example: Pool open until 10 pm. Rinse off sand before swimming.",
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: { title: "titleEn" },
            prepare({ title }) {
              return { title: title || "Area rule" };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "houseRulesReview",
      title: "House rules (review icons)",
      type: "object",
      group: "rules",
      description:
        "Short lines next to smoking, pets, parties, and quiet hours icons in checkout Step 2.",
      fields: [
        defineField({
          name: "smokingEn",
          title: "Smoking",
          type: "string",
          description:
            "Example: No smoking inside. Outdoor areas only.",
          validation: (Rule) => Rule.max(180),
        }),
        defineField({
          name: "dogsEn",
          title: "Pets",
          type: "string",
          description:
            "Example: Pets are not allowed, or Up to 1 pet with prior approval.",
          validation: (Rule) => Rule.max(180),
        }),
        defineField({
          name: "partiesEn",
          title: "Parties",
          type: "string",
          description:
            "Example: No parties or extra guests beyond max occupancy.",
          validation: (Rule) => Rule.max(180),
        }),
        defineField({
          name: "quietHoursEn",
          title: "Quiet hours",
          type: "string",
          description: "Example: Quiet hours from 10:00 PM to 8:00 AM.",
          validation: (Rule) => Rule.max(180),
        }),
      ],
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      group: "media",
      description:
        "Primary visual for cards, headers, and social previews. Use the strongest landscape photo.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description:
            "Accessibility text for the hero. Example: Wooden villa porch overlooking the Blessed House gardens.",
        }),
      ],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      group: "media",
      description:
        "Additional photos in display order. First image can double as a secondary cover if needed.",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              description:
                "Describe the photo for accessibility. Example: King bed with mosquito net and garden view.",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "bookingUrl",
      title: "External booking URL",
      type: "url",
      group: "basics",
      description:
        "Optional Airbnb or VRBO fallback while direct booking rolls out. Example: https://www.airbnb.com/rooms/123456.",
      validation: (Rule) =>
        Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "mapLocation",
      title: "Map location (geopoint)",
      type: "geopoint",
      group: "map",
      description:
        "Exact map pin for this unit. Example: drag the marker onto the Blessed House site. Shared coordinates across units are fine.",
    }),
    defineField({
      name: "listed",
      title: "Listed for booking",
      type: "boolean",
      group: "basics",
      description:
        "When on, this unit appears in availability and booking flows. Turn off to hide without deleting. Example: off during renovation.",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      kind: "propertyKind.titleEn",
      locationLabel: "locationRef.label_en",
      media: "heroImage",
    },
    prepare({ title, kind, locationLabel, media }) {
      return {
        title: title || "Untitled property",
        subtitle: [kind, locationLabel].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
