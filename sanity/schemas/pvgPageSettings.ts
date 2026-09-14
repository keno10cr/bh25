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
    defineField({
      name: "capacityImage",
      title: "Photo",
      type: "image",
      group: "capacity",
      description:
        "Photo beside the specs (about 40% width). Best size: 1600 × 1200 pixels (4:3).",
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
  ],
  preview: {
    prepare: () => ({ title: "Puerto Viejo Groups (/pvg)" }),
  },
});
