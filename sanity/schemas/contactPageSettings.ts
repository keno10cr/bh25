import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";
import { IMAGE_GUIDE } from "./imageGuides";

export const contactPageSettings = defineType({
  name: "contactPageSettings",
  title: "Contact",
  type: "document",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({ name: "title", title: "Page title", type: "string" }),
    ...localizedField({ name: "subtitle", title: "Subtitle", type: "text" }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      description: IMAGE_GUIDE.contactHero,
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description:
            "Describe the contact banner photo. Example: View from El Mirador over Blessed House and the Caribbean.",
        }),
      ],
    }),
    ...localizedField({ name: "formTitle", title: "Form title", type: "string" }),
    ...localizedField({
      name: "infoTitle",
      title: "Contact info title",
      type: "string",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Contact" }),
  },
});
