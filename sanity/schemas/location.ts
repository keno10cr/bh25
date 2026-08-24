import { defineField, defineType } from "sanity";

export const location = defineType({
  name: "location",
  title: "Location",
  type: "document",
  description:
    "Hotel or lodge place label. For Blessed House, create one location and attach every property to it.",
  fields: [
    defineField({
      name: "label_en",
      title: "Label (English)",
      type: "string",
      description: "Central hotel or lodge label. Example: Blessed House.",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "label_es",
      title: "Label (Spanish)",
      type: "string",
      description:
        "Optional Spanish label. Example: Blessed House. Falls back to English on the site when empty.",
    }),
    defineField({
      name: "footerDisplay",
      title: "Show in footer destinations",
      type: "boolean",
      description:
        "When on, this location can appear in footer destination lists. Example: on for Blessed House.",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "label_en",
      subtitle: "label_es",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Untitled location",
        subtitle: subtitle || "Spanish label falls back to English",
      };
    },
  },
});
