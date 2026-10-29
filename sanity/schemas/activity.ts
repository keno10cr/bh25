import { defineArrayMember, defineField, defineType } from "sanity";
import { i18nFieldset, localizedField, TRANSLATION_LOCALES } from "./i18n";

const whatsIncludedMember = defineArrayMember({
  type: "object",
  name: "whatsIncludedItem",
  fields: [
    defineField({
      name: "label",
      title: "Feature",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "label" },
  },
});

function whatsIncludedFields() {
  return [
    defineField({
      name: "whatsIncluded",
      title: "What's included",
      type: "array",
      of: [whatsIncludedMember],
      description:
        "Add 3 to 6 things that are included, such as a guide or transport. These show as short labels on the activity page.",
    }),
    ...TRANSLATION_LOCALES.map((locale) =>
      defineField({
        name: `whatsIncluded${locale.code}`,
        title: `What's included (${locale.title})`,
        type: "array",
        of: [whatsIncludedMember],
        fieldset: "i18n",
      })
    ),
  ];
}

export const activity = defineType({
  name: "activity",
  title: "Activity",
  type: "document",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The name guests see. Example: Morena Clara Chocolate Tour.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "The URL-friendly version of the name, usually lowercase with hyphens, e.g., 'morena-clara-chocolate-tour'. Click Generate to fill this from the title. This becomes the page address after /activities/.",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "legendItems",
      title: "Legend items",
      type: "array",
      of: [{ type: "reference", to: [{ type: "legendItem" }] }],
      description:
        "Choose the map groups this activity belongs to, such as Beaches, Tours, or Dining. You can pick more than one.",
      validation: (Rule) => Rule.min(1).unique(),
    }),
    defineField({
      name: "groupOnly",
      title: "Group only",
      type: "boolean",
      initialValue: false,
      description:
        "Turn this on to hide the activity from the public Activities page. It still shows on the Puerto Viejo Groups page and the internal proposal tools.",
    }),
    defineField({
      name: "category",
      title: "Legacy category",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "difficulty",
      title: "Difficulty",
      type: "string",
      description: "How hard this is for a typical guest. Easy, Moderate, or Challenging.",
      options: {
        list: [
          { title: "Easy", value: "Easy" },
          { title: "Moderate", value: "Moderate" },
          { title: "Challenging", value: "Challenging" },
        ],
        layout: "radio",
      },
    }),
    ...localizedField({
      name: "duration",
      title: "Duration",
      type: "string",
      description:
        "How long the activity takes. Write a short phrase guests can understand.",
      placeholder: "Example: 2 hours or Half day",
    }),
    ...localizedField({
      name: "groupSize",
      title: "Group size",
      type: "string",
      description: "How many people can join. Example: 2 to 8 people.",
      placeholder: "Example: 2 to 8 people",
    }),
    defineField({
      name: "coordinates",
      title: "Coordinates",
      type: "geopoint",
      description:
        "Map pin for this place or pickup point. Right-click a location on Google Maps to copy latitude and longitude numbers. Paste the first number into Latitude and the second into Longitude. Leave this empty to hide the pin.",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description:
        "Cover photo for this activity. Best size: 1600 × 900 pixels (16:9 landscape) or 1600 × 1200 (4:3). Prefer wide photos of the place or experience. Avoid very tall portrait photos.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description:
            "A short description of the photo for people who cannot see it, and for search. If you leave this empty, the site uses the activity title. Example: Green boat on turquoise water near Punta Mona, Costa Rica.",
        }),
      ],
    }),
    ...localizedField({
      name: "description",
      title: "Description",
      type: "blockContent",
      description:
        "Tell guests what they will do, where they will go, and anything they should bring. Write this in English.",
    }),
    ...whatsIncludedFields(),
    defineField({
      name: "gallery",
      title: "Photo gallery",
      type: "array",
      description:
        "Optional extra photos shown below the description. Recommended dimensions: 1600 × 1080 (3:2 ratio) or 1600 × 900 (16:9 ratio). Keep each file under 5MB.",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              description:
                "A short description of this photo for people who cannot see it. Example: Wooden trail through Cahuita National Park canopy.",
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "legendItems.0.title",
      media: "image",
      groupOnly: "groupOnly",
    },
    prepare: ({ title, subtitle, media, groupOnly }) => ({
      title,
      subtitle: groupOnly
        ? `${subtitle || "Activity"} · Group only`
        : subtitle,
      media,
    }),
  },
});
