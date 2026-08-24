import { defineField, defineType } from "sanity";

export const roomType = defineType({
  name: "roomType",
  title: "Room / space type",
  type: "document",
  description:
    "Reusable sleeping spaces (bedrooms, suites, common areas). Attach on each property under House arrangements.",
  fields: [
    defineField({
      name: "titleEn",
      title: "Title (English)",
      type: "string",
      description: "Library title for this space. Example: Master Suite, Guest Bedroom, Bunk Room.",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "titleEs",
      title: "Title (Spanish)",
      type: "string",
      description: "Spanish library title. Example: Suite principal, Dormitorio de huéspedes.",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "configEn",
      title: "Bed / layout (English)",
      type: "string",
      description: "Bed layout shown to guests. Example: 1 king bed, or 2 twin beds.",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "configEs",
      title: "Bed / layout (Spanish)",
      type: "string",
      description: "Spanish bed layout. Example: 1 cama king, or 2 camas twin.",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "capacity",
      title: "Sleeps (per space)",
      type: "number",
      description:
        "Guests this one space sleeps. Property capacity = sum of (capacity × quantity). Example: 2 for a king room.",
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Icon used in sleeping arrangement UI. Example: bed for a standard bedroom.",
      options: {
        list: [
          { title: "Bed", value: "bed" },
          { title: "Sofa bed", value: "sofa" },
          { title: "Bunk / stacked", value: "bunk" },
          { title: "Double bed", value: "double" },
          { title: "Tent / glamping", value: "tent" },
          { title: "House / generic space", value: "house" },
        ],
        layout: "dropdown",
      },
      initialValue: "bed",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      titleEn: "titleEn",
      titleEs: "titleEs",
      capacity: "capacity",
      configEn: "configEn",
    },
    prepare({ titleEn, titleEs, capacity, configEn }) {
      return {
        title: titleEn || titleEs || "Room type",
        subtitle: [
          typeof capacity === "number" ? `Sleeps ${capacity}` : "",
          configEn,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
