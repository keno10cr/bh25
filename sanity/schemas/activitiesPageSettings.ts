import { defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";

export const activitiesPageSettings = defineType({
  name: "activitiesPageSettings",
  title: "Activities page",
  type: "document",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({ name: "title", title: "Page title", type: "string" }),
    ...localizedField({ name: "subtitle", title: "Subtitle", type: "text" }),
  ],
  preview: {
    prepare: () => ({ title: "Activities page" }),
  },
});
