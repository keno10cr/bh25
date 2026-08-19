import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";

export const villa = defineType({
  name: "villa",
  title: "Villa",
  type: "document",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "capacity",
      title: "Capacity (max people)",
      type: "number",
      validation: (Rule) => Rule.min(1).integer(),
    }),
    defineField({
      name: "bedrooms",
      title: "Bedrooms",
      type: "number",
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: "bathrooms",
      title: "Bathrooms",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "amenities",
      title: "Amenities",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    ...localizedField({
      name: "description",
      title: "Description",
      type: "blockContent",
    }),
    defineField({
      name: "bookingUrl",
      title: "Booking URL",
      type: "url",
      description: "Airbnb, VRBO, or other booking link",
      validation: (Rule) =>
        Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "slug.current", media: "gallery.0" },
  },
});
