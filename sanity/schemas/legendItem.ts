import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";

export const legendItem = defineType({
  name: "legendItem",
  title: "Legend item",
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
      name: "color",
      title: "Pin color",
      type: "string",
      description: "Hex color for map pins, for example #0a4c3a",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "color" },
  },
});
