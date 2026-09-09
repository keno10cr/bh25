import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";
import { IMAGE_GUIDE } from "./imageGuides";

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
      description: IMAGE_GUIDE.blog,
      options: { hotspot: true },
      validation: (Rule) =>
        Rule.custom(async (value, context) => {
          if (!value?.asset?._ref) return true;
          const client = context.getClient({ apiVersion: "2025-08-01" });
          const dims = await client.fetch(
            `*[_id == $id][0].metadata.dimensions{width,height}`,
            { id: value.asset._ref }
          );
          if (!dims?.width || !dims?.height) {
            return "Could not read image size. Please upload the photo again.";
          }
          if (Math.min(dims.width, dims.height) < 950) {
            return "Shortest side must be at least 950 pixels. Wider or taller photos are fine.";
          }
          return true;
        }),
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description:
            "Describe the photo for accessibility and SEO. If you leave this empty, the site uses the post title and category. Example: Coastal trail toward Punta Mona near Manzanillo, Costa Rica.",
        }),
      ],
    }),
    ...localizedField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    ...localizedField({
      name: "socialTitle",
      title: "Social title",
      type: "string",
      description:
        "Short, punchy line for share images. Aim for curiosity, not the full blog title. Example: Exploring Manzanillo wild coast.",
      validation: (Rule) =>
        Rule.required()
          .max(48)
          .error("Keep the social title to 48 characters or fewer."),
    }),
    ...localizedField({
      name: "socialHook",
      title: "Social hook",
      type: "text",
      rows: 3,
      description:
        "One or two sentences for tall share images (TikTok and Pinterest). Write for curiosity, not as a full excerpt.",
      validation: (Rule) =>
        Rule.required()
          .max(160)
          .error("Keep the social hook to 160 characters or fewer."),
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
