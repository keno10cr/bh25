import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";

export const review = defineType({
  name: "review",
  title: "Review",
  type: "document",
  fieldsets: [i18nFieldset],
  fields: [
    defineField({
      name: "guestName",
      title: "Guest name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
      options: {
        list: [1, 2, 3, 4, 5],
        layout: "radio",
      },
    }),
    ...localizedField({
      name: "comment",
      title: "Comment",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "villaRef",
      title: "Villa",
      type: "reference",
      to: [{ type: "villa" }],
      description: "Optional. Leave empty for a general property review.",
    }),
  ],
  preview: {
    select: {
      title: "guestName",
      rating: "rating",
      villa: "villaRef.name",
    },
    prepare({ title, rating, villa }) {
      const stars = "★".repeat(rating || 0);
      return {
        title,
        subtitle: villa ? `${stars} · ${villa}` : stars,
      };
    },
  },
});
