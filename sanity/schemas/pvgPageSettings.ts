import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";
import { IMAGE_GUIDE } from "./imageGuides";

const pillarItem = {
  type: "object",
  name: "pvgPillar",
  title: "Pillar",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({ name: "title", title: "Title", type: "string" }),
    ...localizedField({
      name: "body",
      title: "Body",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description:
        "Photo for this pillar. Best size: 1200 × 900 pixels (4:3 landscape).",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "body", media: "image" },
  },
};

const capacitySpecItem = {
  type: "object",
  name: "pvgCapacitySpec",
  title: "Spec",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({ name: "label", title: "Label", type: "string" }),
    ...localizedField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "text" },
  },
};

export const pvgPageSettings = defineType({
  name: "pvgPageSettings",
  title: "Puerto Viejo Groups",
  type: "document",
  fieldsets: [i18nFieldset],
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "guarantee", title: "Guarantee" },
    { name: "pillars", title: "Built for focus" },
    { name: "capacity", title: "Capacity & Settings" },
    { name: "location", title: "Location" },
    { name: "inquiry", title: "Send a request" },
    { name: "promo", title: "Groups promo (Home & Contact)" },
  ],
  fields: [
    ...localizedField({
      name: "heroBrandLine",
      title: "Brand line",
      type: "string",
      group: "hero",
    }),
    ...localizedField({
      name: "heroHeadline",
      title: "Headline",
      type: "text",
      rows: 3,
      group: "hero",
    }),
    ...localizedField({
      name: "heroSubtitle",
      title: "Subtitle",
      type: "text",
      rows: 3,
      group: "hero",
    }),
    ...localizedField({
      name: "heroCta",
      title: "CTA label",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      group: "hero",
      description: IMAGE_GUIDE.homeHero,
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
        }),
      ],
    }),

    defineField({
      name: "guaranteeLogo",
      title: "Logo",
      type: "image",
      group: "guarantee",
      description: "Logo shown above the guarantee title. Square PNG works best.",
      options: { hotspot: true },
    }),
    ...localizedField({
      name: "guaranteeTitle",
      title: "Title",
      type: "string",
      group: "guarantee",
    }),
    ...localizedField({
      name: "guaranteeBody",
      title: "Body",
      type: "text",
      rows: 4,
      group: "guarantee",
    }),

    ...localizedField({
      name: "pillarsTitle",
      title: "Section title",
      type: "string",
      group: "pillars",
    }),
    defineField({
      name: "pillars",
      title: "Pillars",
      type: "array",
      group: "pillars",
      of: [pillarItem],
    }),

    ...localizedField({
      name: "capacityTitle",
      title: "Section title",
      type: "string",
      group: "capacity",
    }),
    defineField({
      name: "capacitySpecs",
      title: "Specs",
      type: "array",
      group: "capacity",
      of: [capacitySpecItem],
    }),

    ...localizedField({
      name: "locationTitle",
      title: "Section title",
      type: "string",
      group: "location",
    }),
    ...localizedField({
      name: "locationLead",
      title: "Lead text",
      type: "text",
      rows: 3,
      group: "location",
    }),
    defineField({
      name: "locationLat",
      title: "Latitude",
      type: "number",
      group: "location",
      validation: (Rule) => Rule.min(-90).max(90),
    }),
    defineField({
      name: "locationLng",
      title: "Longitude",
      type: "number",
      group: "location",
      validation: (Rule) => Rule.min(-180).max(180),
    }),
    ...localizedField({
      name: "petsTitle",
      title: "Pets line",
      type: "string",
      group: "location",
      description:
        "One short line under the location text. Clicking it opens the pets details. Example: Pets are welcome at Blessed House.",
    }),
    ...localizedField({
      name: "petsNote",
      title: "Pets details",
      type: "text",
      rows: 3,
      group: "location",
      description:
        "Shown in the pets popup with a link to the villas house rules. Example: Check the house rules, and pets are not allowed inside national parks.",
    }),
    ...localizedField({
      name: "petsLinkLabel",
      title: "Pets popup link",
      type: "string",
      group: "location",
      description: "Link at the bottom of the pets popup. Example: Read the house rules",
    }),
    ...localizedField({
      name: "locationLegendLabel",
      title: "Map legend label",
      type: "string",
      group: "location",
    }),
    ...localizedField({
      name: "activitiesTitle",
      title: "Activities slider title",
      type: "string",
      group: "location",
      description:
        "Title above the activity image slider. Activities themselves come from the Activities collection.",
    }),

    ...localizedField({
      name: "inquiryTitle",
      title: "Form title",
      type: "string",
      group: "inquiry",
    }),
    ...localizedField({
      name: "inquiryLead",
      title: "Lead text",
      type: "text",
      rows: 3,
      group: "inquiry",
    }),
    ...localizedField({
      name: "inquirySubmitLabel",
      title: "Submit button",
      type: "string",
      group: "inquiry",
    }),
    ...localizedField({
      name: "inquirySubmittingLabel",
      title: "Submitting button",
      type: "string",
      group: "inquiry",
    }),
    ...localizedField({
      name: "inquirySuccessMessage",
      title: "Success message",
      type: "text",
      rows: 3,
      group: "inquiry",
    }),
    ...localizedField({
      name: "organizationLabel",
      title: "Field 1: Organization label",
      type: "string",
      group: "inquiry",
    }),
    ...localizedField({
      name: "attendeesLabel",
      title: "Field 2: Attendees label",
      type: "string",
      group: "inquiry",
    }),
    ...localizedField({
      name: "attendeeUnit",
      title: "Field 2: Word under each range",
      type: "string",
      group: "inquiry",
      description: "Shown under 20 to 29, 30 to 39, 40 to 45. Example: guests",
    }),
    ...localizedField({
      name: "datesLabel",
      title: "Field 3: Dates label",
      type: "string",
      group: "inquiry",
    }),
    ...localizedField({
      name: "datesHint",
      title: "Field 3: Dates hint",
      type: "text",
      rows: 2,
      group: "inquiry",
    }),
    ...localizedField({
      name: "optionLabel",
      title: "Field 3: Date option label",
      type: "string",
      group: "inquiry",
      description: "Followed by the number. Example: Option",
    }),
    ...localizedField({
      name: "addRangeLabel",
      title: "Field 3: Add range button",
      type: "string",
      group: "inquiry",
    }),
    ...localizedField({
      name: "contactNameLabel",
      title: "Field 4: Name label",
      type: "string",
      group: "inquiry",
    }),
    ...localizedField({
      name: "emailLabel",
      title: "Field 5: Email label",
      type: "string",
      group: "inquiry",
    }),
    defineField({
      name: "hostImage",
      title: "Host photo",
      type: "image",
      group: "inquiry",
      description:
        "Photo beside the request form on desktop and under it on mobile. Best size: 1600 × 1200 pixels (4:3 landscape). Drag the focus point onto the face.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Example: Floribel Fadell smiling at the Blessed House reception.",
        }),
      ],
    }),
    ...localizedField({
      name: "hostQuote",
      title: "Host quote",
      type: "text",
      rows: 3,
      group: "inquiry",
      description:
        "Short personal invitation shown above the host photo. Keep it to one or two sentences.",
    }),
    defineField({
      name: "hostName",
      title: "Host name",
      type: "string",
      group: "inquiry",
      description: "Example: Floribel Fadell",
    }),
    ...localizedField({
      name: "hostRole",
      title: "Host role",
      type: "string",
      group: "inquiry",
      description: "Example: Owner of Blessed House",
    }),

    defineField({
      name: "promoImage",
      title: "Image",
      type: "image",
      group: "promo",
      description:
        "Photo on the left of the groups banner shown on the Home and Contact pages. Best size: 1400 × 1000 pixels (landscape).",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
        }),
      ],
    }),
    ...localizedField({
      name: "promoEyebrow",
      title: "Small line above the title",
      type: "string",
      group: "promo",
      description: "Example: Groups of 20 to 45",
    }),
    ...localizedField({
      name: "promoTitle",
      title: "Title",
      type: "string",
      group: "promo",
    }),
    ...localizedField({
      name: "promoBody",
      title: "Body",
      type: "text",
      rows: 3,
      group: "promo",
    }),
    ...localizedField({
      name: "promoCta",
      title: "Button label",
      type: "string",
      group: "promo",
      description: "Links to the Puerto Viejo Groups page. Example: Book Groups",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Puerto Viejo Groups (/pvg)" }),
  },
});
