import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";

export const blog = defineType({
  name: "blog",
  title: "Blog post",
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
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Flora", value: "Flora" },
          { title: "Fauna", value: "Fauna" },
          { title: "Local Spot", value: "Local Spot" },
          { title: "Retreats", value: "Retreats" },
          { title: "National Parks", value: "National Parks" },
        ],
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
    }),
    defineField({
      name: "featuredImage",
      title: "Featured image",
      type: "image",
      description:
        "Main blog image. Best size: 1600 × 900 pixels (16:9 landscape). Wide photos look best in the blog list and at the top of each post.",
      options: { hotspot: true },
    }),
    ...localizedField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    ...localizedField({
      name: "content",
      title: "Content",
      type: "blockContent",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "featuredImage",
    },
  },
  orderings: [
    {
      title: "Publish date, newest",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
