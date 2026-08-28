import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";

export const activity = defineType({
  name: "activity",
  title: "Activity",
  type: "document",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "legendItems",
      title: "Legend items",
      type: "array",
      of: [{ type: "reference", to: [{ type: "legendItem" }] }],
      description: "An activity can belong to more than one legend group.",
      validation: (Rule) => Rule.min(1).unique(),
    }),
    defineField({
      name: "category",
      title: "Legacy category",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "difficulty",
      title: "Difficulty",
      type: "string",
      options: {
        list: [
          { title: "Easy", value: "Easy" },
          { title: "Moderate", value: "Moderate" },
          { title: "Challenging", value: "Challenging" },
        ],
        layout: "radio",
      },
    }),
    ...localizedField({ name: "duration", title: "Duration", type: "string" }),
    ...localizedField({ name: "groupSize", title: "Group size", type: "string" }),
    defineField({
      name: "coordinates",
      title: "Coordinates",
      type: "geopoint",
      description: "Used for the activities map. Leave empty to hide this pin.",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description:
        "Cover photo for this activity. Best size: 1600 × 900 pixels (16:9 landscape) or 1600 × 1200 (4:3). Prefer wide photos of the place or experience. Avoid very tall portrait photos.",
      options: { hotspot: true },
    }),
    ...localizedField({
      name: "description",
      title: "Description",
      type: "blockContent",
    }),
    ...localizedField({
      name: "whatsIncluded",
      title: "What's included",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Add 3 to 6 key features included in this activity. These appear as pills on the activity page.",
      options: { layout: "tags" },
    }),
    defineField({
      name: "gallery",
      title: "Photo gallery",
      type: "array",
      description:
        "Optional extra photos shown below the description. Recommended dimensions: 1600 × 1080 (3:2 ratio) or 1600 × 900 (16:9 ratio). Keep each file under 5MB.",
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
                "Describe the photo for accessibility and SEO. Example: Wooden trail through Cahuita National Park canopy.",
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "legendItems.0.title", media: "image" },
  },
});
