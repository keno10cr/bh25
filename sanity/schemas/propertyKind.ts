import { defineField, defineType } from "sanity";

/** Library of bookable unit kinds (Villa, Room, Suite). */
export const propertyKind = defineType({
  name: "propertyKind",
  title: "Property type",
  type: "document",
  description:
    "Reusable kinds for filters and cards. Create Villa, Room, and Suite once, then attach them on each property.",
  fields: [
    defineField({
      name: "titleEn",
      title: "Title (English)",
      type: "string",
      description: "English kind label. Example: Villa, Room, or Suite.",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "titleEs",
      title: "Title (Spanish)",
      type: "string",
      description: "Spanish kind label. Example: Villa, Habitación, or Suite.",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "iconSvg",
      title: "Icon (SVG file)",
      type: "file",
      description:
        "Optional SVG icon for map popups and filters. Example: upload a simple house or bed icon as .svg.",
      options: {
        accept: "image/svg+xml,.svg",
      },
    }),
  ],
  preview: {
    select: { titleEn: "titleEn", titleEs: "titleEs", media: "iconSvg" },
    prepare({ titleEn, titleEs, media }) {
      return {
        title: titleEn || titleEs || "Property type",
        subtitle: titleEs && titleEn !== titleEs ? titleEs : undefined,
        media,
      };
    },
  },
});
