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
  ],
  preview: {
    select: { title: "title", subtitle: "legendItems.0.title", media: "image" },
  },
});
