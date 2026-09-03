import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";
import { IMAGE_GUIDE } from "./imageGuides";

const cardI18n = {
  type: "object",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({ name: "title", title: "Title", type: "string" }),
    ...localizedField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "image",
      title: "Icon",
      type: "image",
      description:
        "Small icon for a homepage card. Best size: 512 × 512 pixels (square). Simple graphics work best; avoid busy photos.",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "description", media: "image" },
  },
};

const featuredI18n = {
  type: "object",
  fieldsets: [i18nFieldset],
  fields: [
    defineField({ name: "slug", title: "Villa slug", type: "string" }),
    ...localizedField({ name: "name", title: "Name", type: "string" }),
    ...localizedField({
      name: "teaser",
      title: "Short description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description:
        "Villa teaser image on the homepage. Best size: 1200 × 900 pixels (4:3) or 1200 × 675 (16:9). Use a wide landscape photo.",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "teaser", media: "image" },
  },
};

export const homePageSettings = defineType({
  name: "homePageSettings",
  title: "Homepage",
  type: "document",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({ name: "heroTitle", title: "Hero title", type: "string" }),
    ...localizedField({
      name: "heroSubtitle",
      title: "Hero subtitle",
      type: "text",
      rows: 3,
    }),
    ...localizedField({
      name: "heroCtaPrimary",
      title: "Hero primary button",
      type: "string",
    }),
    ...localizedField({
      name: "heroCtaSecondary",
      title: "Hero secondary button",
      type: "string",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      description: IMAGE_GUIDE.homeHero,
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description:
            "Describe the hero photo for accessibility and SEO. Example: Caribbean style villa with jungle view at Blessed House.",
        }),
      ],
    }),
    ...localizedField({
      name: "featuredTitle",
      title: "Featured villas title",
      type: "string",
    }),
    ...localizedField({
      name: "featuredSubtitle",
      title: "Featured villas subtitle",
      type: "text",
    }),
    ...localizedField({
      name: "featuredLearnMore",
      title: "Featured learn more",
      type: "string",
    }),
    ...localizedField({
      name: "featuredCta",
      title: "Featured view all button",
      type: "string",
    }),
    defineField({
      name: "featuredItems",
      title: "Featured villa cards",
      type: "array",
      of: [featuredI18n],
    }),
    ...localizedField({
      name: "locationTitle",
      title: "Location title",
      type: "string",
    }),
    ...localizedField({
      name: "locationDescription",
      title: "Location description",
      type: "text",
    }),
    ...localizedField({
      name: "locationMapsInfo",
      title: "Location maps label",
      type: "string",
    }),
    ...localizedField({
      name: "locationMapsQuery",
      title: "Location maps query",
      type: "string",
    }),
    ...localizedField({
      name: "locationCta",
      title: "Location button",
      type: "string",
    }),
    defineField({
      name: "locationImage",
      title: "Location map image",
      type: "image",
      description:
        "Map photo behind the Location box on the homepage. Best size: 1500 × 1084 pixels or similar wide landscape. This is the satellite map that moves as visitors scroll.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description:
            "Describe the map for accessibility and SEO. Example: Satellite map of Blessed House near Puerto Viejo de Talamanca.",
        }),
      ],
    }),
    ...localizedField({
      name: "activitiesTitle",
      title: "Things to do title",
      type: "string",
    }),
    ...localizedField({
      name: "activitiesSubtitle",
      title: "Things to do subtitle",
      type: "text",
    }),
    ...localizedField({
      name: "activitiesCta",
      title: "Things to do button",
      type: "string",
    }),
    defineField({
      name: "thingsToDoItems",
      title: "Things to do cards",
      type: "array",
      of: [cardI18n],
    }),
    ...localizedField({
      name: "reviewsTitle",
      title: "Reviews title",
      type: "string",
    }),
    ...localizedField({
      name: "reviewsSubtitle",
      title: "Reviews subtitle",
      type: "text",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Homepage" }),
  },
});
