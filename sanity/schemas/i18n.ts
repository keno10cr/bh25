import { defineField } from "sanity";

export const TRANSLATION_LOCALES = [
  { code: "Es", title: "Spanish" },
  { code: "De", title: "German" },
  { code: "Nl", title: "Dutch" },
  { code: "Fr", title: "French" },
  { code: "Ja", title: "Japanese" },
  { code: "Pt", title: "Portuguese" },
];

export const i18nFieldset = {
  name: "i18n",
  title: "Translations",
  description:
    "English fields above are the source. A later script will fill these (titleEs, bodyEs, and so on).",
  options: { collapsible: true, collapsed: true },
};

export function localizedField({ name, title, type, ...rest }) {
  const { validation, fieldset, group, hidden, ...shared } = rest;
  return [
    defineField({ name, title, type, validation, fieldset, group, hidden, ...shared }),
    ...TRANSLATION_LOCALES.map((locale) =>
      defineField({
        name: `${name}${locale.code}`,
        title: `${title} (${locale.title})`,
        type,
        fieldset: "i18n",
        ...shared,
      })
    ),
  ];
}
