import { defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";
import { IMAGE_GUIDE } from "./imageGuides";

export const footerSettings = defineType({
  name: "footerSettings",
  title: "Footer",
  type: "document",
  description:
    "Footer brand copy, contact details, quick links, and social links shown on every page.",
  fieldsets: [i18nFieldset],
  fields: [
    defineField({
      name: "brandName",
      title: "Brand name",
      type: "string",
      description: "Heading in the footer brand column. Example: Blessed House.",
      initialValue: "Blessed House",
      validation: (Rule) => Rule.required().min(2).max(60),
    }),
    ...localizedField({
      name: "locationLine",
      title: "Location under logo",
      type: "string",
      description: "Short place line under the logo. Example: Puerto Viejo, Costa Rica.",
    }),
    ...localizedField({
      name: "tagline",
      title: "Tagline",
      type: "text",
      rows: 2,
      description: "Short brand line under the brand name.",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "Public contact email. Example: blessedhousecr@gmail.com",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "phones",
      title: "Phone numbers",
      type: "array",
      description:
        "Shown in the footer and on the contact page. First number first. Extra numbers show on a new line after \"or\".",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Display number",
              type: "string",
              description: "What visitors see. Example: +1 (754) 610 4710",
              validation: (Rule) => Rule.required().min(5).max(40),
            }),
            defineField({
              name: "tel",
              title: "Click to call number",
              type: "string",
              description:
                "Digits for the tel link, with country code. Example: +17546104710",
              validation: (Rule) =>
                Rule.required().regex(/^\+?[0-9]+$/, {
                  name: "phone",
                  invert: false,
                }),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "tel" },
            prepare({ title, subtitle }) {
              return {
                title: title || "Phone",
                subtitle: subtitle || "",
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "addressLine",
      title: "Address line",
      type: "string",
      description:
        "Address under contact info. Example: Puerto Viejo, Limón, Costa Rica",
      validation: (Rule) => Rule.required().min(5).max(120),
    }),
    defineField({
      name: "quickLinks",
      title: "Quick links",
      type: "array",
      description: "Footer link list. Usually matches the main nav.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label (English)",
              type: "string",
              validation: (Rule) => Rule.required().min(1).max(40),
            }),
            defineField({
              name: "href",
              title: "Path",
              type: "string",
              validation: (Rule) =>
                Rule.required().regex(/^\/[a-z0-9\-\/]*$/i, {
                  name: "path",
                  invert: false,
                }),
            }),
            defineField({
              name: "enabled",
              title: "Enabled",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "href", enabled: "enabled" },
            prepare({ title, subtitle, enabled }) {
              return {
                title: title || "Link",
                subtitle: enabled === false ? `${subtitle} (hidden)` : subtitle,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      description:
        "Footer social icons. Upload a square icon for each link. Network is used for tracking and as a fallback icon if no image is uploaded.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "network",
              title: "Network",
              type: "string",
              options: {
                list: [
                  { title: "Instagram", value: "instagram" },
                  { title: "Airbnb", value: "airbnb" },
                  { title: "YouTube", value: "youtube" },
                ],
                layout: "radio",
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "icon",
              title: "Icon image",
              type: "image",
              description: IMAGE_GUIDE.socialIcon,
              options: { hotspot: true },
              fields: [
                defineField({
                  name: "alt",
                  title: "Alt text",
                  type: "string",
                  description:
                    "Short description of the icon. Example: Instagram logo.",
                }),
              ],
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
            }),
            defineField({
              name: "label",
              title: "Accessible label",
              type: "string",
              description: "Screen reader name. Example: Instagram",
              validation: (Rule) => Rule.required().min(2).max(40),
            }),
            defineField({
              name: "enabled",
              title: "Enabled",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: "label",
              subtitle: "url",
              enabled: "enabled",
              media: "icon",
            },
            prepare({ title, subtitle, enabled, media }) {
              return {
                title: title || "Social",
                subtitle: enabled === false ? `${subtitle} (hidden)` : subtitle,
                media,
              };
            },
          },
        },
      ],
    }),
    ...localizedField({
      name: "copyright",
      title: "Copyright line",
      type: "string",
      description:
        "Text after the year and brand. Example: All rights reserved.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Footer" }),
  },
});
