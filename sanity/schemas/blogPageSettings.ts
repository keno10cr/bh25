import { defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";

export const blogPageSettings = defineType({
  name: "blogPageSettings",
  title: "Blog page",
  type: "document",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({ name: "title", title: "Page title", type: "string" }),
    ...localizedField({ name: "subtitle", title: "Subtitle", type: "text" }),
  ],
  preview: {
    prepare: () => ({ title: "Blog page" }),
  },
});
