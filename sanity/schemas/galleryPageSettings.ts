import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";
import { IMAGE_GUIDE } from "./imageGuides";

export const galleryPageSettings = defineType({
  name: "galleryPageSettings",
  title: "Gallery",
  type: "document",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({ name: "title", title: "Page title", type: "string" }),
    ...localizedField({
      name: "description",
      title: "Page description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "images",
      title: "Gallery photos",
      type: "array",
      description: IMAGE_GUIDE.gallery,
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
                "Describe the photo for accessibility and SEO. Example: Shared pool at Blessed House.",
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
              description: "Short label shown on the photo overlay.",
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Gallery" }),
  },
});
