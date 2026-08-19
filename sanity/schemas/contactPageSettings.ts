import { defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";

export const contactPageSettings = defineType({
  name: "contactPageSettings",
  title: "Contact",
  type: "document",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({ name: "title", title: "Page title", type: "string" }),
    ...localizedField({ name: "subtitle", title: "Subtitle", type: "text" }),
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
