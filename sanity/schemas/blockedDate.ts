import { defineField, defineType } from "sanity";

function lockedWhenAirbnb(context) {
  return context?.document?.source === "airbnb";
}

export const blockedDate = defineType({
  name: "blockedDate",
  title: "Blocked date",
  type: "document",
  description:
    "Manual calendar block for one property. Used for owner stays, maintenance, and nights copied from Airbnb. Paid stayBooking nights are blocked separately by the availability API. Airbnb rows are replaced on each sync.",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Internal label for the calendar. Example: Owner stay or Pool pump repair.",
      readOnly: lockedWhenAirbnb,
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "startDate",
      title: "Start date",
      type: "date",
      description: "First unavailable night. Example: 2026-10-01.",
      readOnly: lockedWhenAirbnb,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "End date",
      type: "date",
      description:
        "Last unavailable night (inclusive). Example: 2026-10-05 blocks Oct 1 through Oct 5.",
      readOnly: lockedWhenAirbnb,
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
      readOnly: lockedWhenAirbnb,
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
      readOnly: lockedWhenAirbnb,
      initialValue: "owner",
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      description:
        "Airbnb blocks are replaced about every 20 minutes. Edit manual blocks only.",
      readOnly: true,
      hidden: (context) => context?.document?.source !== "airbnb",
      options: {
        list: [
          { title: "Manual", value: "manual" },
          { title: "Airbnb", value: "airbnb" },
        ],
      },
      initialValue: "manual",
    }),
    defineField({
      name: "externalUid",
      title: "External event id",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      startDate: "startDate",
      endDate: "endDate",
      propertyTitle: "property.name",
      source: "source",
    },
    prepare({ title, startDate, endDate, propertyTitle, source }) {
      const dateRange =
        startDate && endDate ? `${startDate} to ${endDate}` : "No dates set";
      const where = [propertyTitle || "No property", source === "airbnb" ? "Airbnb" : ""]
        .filter(Boolean)
        .join(" · ");
      return {
        title: title || "Untitled block",
        subtitle: `${where} | ${dateRange}`,
      };
    },
  },
});
