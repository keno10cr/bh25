import { defineField, defineType } from "sanity";

export const blockedDate = defineType({
  name: "blockedDate",
  title: "Blocked date",
  type: "document",
  description:
    "Manual calendar block for one property. Used for owner stays, maintenance, and external bookings. Paid stayBooking nights are blocked separately by the availability API.",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Internal label for the calendar. Example: Owner stay or Pool pump repair.",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "startDate",
      title: "Start date",
      type: "date",
      description: "First unavailable night. Example: 2026-10-01.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "End date",
      type: "date",
      description:
        "Last unavailable night (inclusive). Example: 2026-10-05 blocks Oct 1 through Oct 5.",
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          const startDate = context.document?.startDate as string | undefined;
          if (!value || !startDate) return true;
          return value >= startDate || "End date must be on or after start date.";
        }),
    }),
    defineField({
      name: "property",
      title: "Property",
      type: "reference",
      description: "Which bookable unit this block applies to. Example: Villa 8.",
      to: [{ type: "property" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "reason",
      title: "Reason",
      type: "string",
      description:
        "Why the nights are closed. Example: Owner block for a family visit, or External booking for an Airbnb hold.",
      options: {
        list: [
          { title: "Owner block", value: "owner" },
          { title: "Maintenance", value: "maintenance" },
          { title: "External booking", value: "external" },
          { title: "Other", value: "other" },
        ],
        layout: "radio",
      },
      initialValue: "owner",
    }),
  ],
  preview: {
    select: {
      title: "title",
      startDate: "startDate",
      endDate: "endDate",
      propertyTitle: "property.name",
    },
    prepare({ title, startDate, endDate, propertyTitle }) {
      const dateRange =
        startDate && endDate ? `${startDate} to ${endDate}` : "No dates set";
      return {
        title: title || "Untitled block",
        subtitle: `${propertyTitle || "No property"} | ${dateRange}`,
      };
    },
  },
});
