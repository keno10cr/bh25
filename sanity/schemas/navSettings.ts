import { defineField, defineType } from "sanity";

export const navSettings = defineType({
  name: "navSettings",
  title: "Navigation",
  type: "document",
  description:
    "Main site navigation links shown in the header on every page.",
  fields: [
    defineField({
      name: "brandName",
      title: "Brand name",
      type: "string",
      description: "Text next to the logo. Example: Blessed House.",
      initialValue: "Blessed House",
      validation: (Rule) => Rule.required().min(2).max(60),
    }),
    defineField({
      name: "links",
      title: "Nav links",
      type: "array",
      description:
        "Header menu links in display order. Labels are English; other languages use the site translation files for known routes.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label (English)",
              type: "string",
              description: "Example: Gallery or Villas.",
              validation: (Rule) => Rule.required().min(1).max(40),
            }),
            defineField({
              name: "href",
              title: "Path",
              type: "string",
              description: "Site path starting with /. Example: /gallery",
              validation: (Rule) =>
                Rule.required().regex(/^\/[a-z0-9\-\/]*$/i, {
                  name: "path",
                  invert: false,
                }),
            }),
            defineField({
              name: "enabled",
              title: "Enabled",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "href", enabled: "enabled" },
            prepare({ title, subtitle, enabled }) {
              return {
                title: title || "Link",
                subtitle: enabled === false ? `${subtitle} (hidden)` : subtitle,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Navigation" }),
  },
});
