import { defineField, defineType } from "sanity";

export const FORM_TYPES = [
  { title: "Guest experience", value: "guestExperience" },
  { title: "Villa comment", value: "villaComment" },
  { title: "Contact message", value: "contact" },
];

export const formSubmission = defineType({
  name: "formSubmission",
  title: "Form submission",
  type: "document",
  fields: [
    defineField({
      name: "formType",
      title: "Form type",
      type: "string",
      options: {
        list: FORM_TYPES,
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "needsReview",
      options: {
        list: [
          { title: "Needs Review", value: "needsReview" },
          { title: "Reviewed", value: "reviewed" },
          { title: "Published", value: "published" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (Rule) => Rule.min(1).max(5).integer(),
      options: {
        list: [1, 2, 3, 4, 5],
        layout: "radio",
      },
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "villaRef",
      title: "Villa",
      type: "reference",
      to: [{ type: "villa" }],
      hidden: ({ document }) => document?.formType !== "villaComment",
    }),
    defineField({
      name: "subject",
      title: "Inquiry subject",
      type: "string",
      hidden: ({ document }) => document?.formType !== "contact",
    }),
    defineField({
      name: "meta",
      title: "Extra details",
      type: "text",
      rows: 4,
      description: "Villa dates, activity choice, and other form extras.",
      hidden: ({ document }) => document?.formType !== "contact",
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      formType: "formType",
      status: "status",
      submittedAt: "submittedAt",
      message: "message",
    },
    prepare({ title, formType, status, submittedAt, message }) {
      const typeLabel =
        FORM_TYPES.find((item) => item.value === formType)?.title || formType;
      const date = submittedAt
        ? new Date(submittedAt).toLocaleDateString("en-CA")
        : "";
      return {
        title: title || "Untitled",
        subtitle: [typeLabel, status, date].filter(Boolean).join(" · "),
        description: message,
      };
    },
  },
});
