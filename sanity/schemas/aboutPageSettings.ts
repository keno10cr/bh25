import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";
import { IMAGE_GUIDE } from "./imageGuides";

export const aboutPageSettings = defineType({
  name: "aboutPageSettings",
  title: "About",
  type: "document",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({ name: "welcomeTitle", title: "Welcome title", type: "string" }),
    ...localizedField({
      name: "welcomeDescription",
      title: "Welcome description",
      type: "text",
      rows: 4,
    }),
    ...localizedField({
      name: "welcomeVideoBy",
      title: "Welcome video credit",
      type: "string",
    }),
    ...localizedField({ name: "ourPlaceTitle", title: "Our Place title", type: "string" }),
    ...localizedField({
      name: "ourPlaceDescription",
      title: "Our Place description",
      type: "text",
      rows: 5,
    }),
    ...localizedField({ name: "ourPlaceCta", title: "Our Place button", type: "string" }),
    defineField({
      name: "ourPlaceImage",
      title: "Our Place image",
      type: "image",
      description: IMAGE_GUIDE.homeHero,
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description:
            "Describe the photo for accessibility and SEO. Example: Shared pool and gardens at Blessed House.",
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "About" }),
  },
});
