import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";

export const jobsPage = defineType({
  name: "jobsPage",
  title: "Jobs page",
  type: "document",
  description:
    "Singleton for the careers landing page: hero title, intro copy, and the line above the job list.",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "Careers page headline. Example: Work with us at Blessed House.",
      validation: (Rule) => Rule.required().min(2),
    }),
    ...localizedField({
      name: "description",
      title: "Description",
      type: "blockContent",
      description:
        "Intro copy under the title. Example: Join a small Caribbean hospitality team that hosts guests from around the world.",
    }),
    ...localizedField({
      name: "listIntro",
      title: "Job list intro",
      type: "text",
      rows: 3,
      description:
        "Short line above the open roles list. Example: Open roles at Blessed House right now.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Jobs page" };
    },
  },
});
