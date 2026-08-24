import { defineArrayMember, defineField, defineType } from "sanity";
import { i18nFieldset, localizedField } from "./i18n";

export const JOB_COMMITMENT_OPTIONS = [
  { title: "Full time", value: "fullTime" },
  { title: "Part time", value: "partTime" },
  { title: "Seasonal", value: "seasonal" },
  { title: "Contract", value: "contract" },
  { title: "Internship", value: "internship" },
];

const CAREERS_LOCATION_QUERY = `*[_type == "systemSettings"][0].careersLocationCatalog[]{locationId}`;
const JOB_TAG_QUERY = `*[_type == "systemSettings"][0].jobListingTagCatalog[]{tagId}`;

export const jobPosting = defineType({
  name: "jobPosting",
  title: "Job posting",
  type: "document",
  description:
    "One open role on the careers page. Applicants submit through /api/job-application and land in Careers Data → Applications.",
  fieldsets: [i18nFieldset],
  fields: [
    ...localizedField({
      name: "positionTitle",
      title: "Position title",
      type: "string",
      description:
        "Role title shown on the jobs list and detail page. Example: Front desk associate.",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "URL path for this role. Example: front-desk-associate.",
      options: { source: "positionTitle", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "locationIds",
      title: "Careers locations",
      type: "array",
      description:
        "One or more location IDs from System Settings → Careers locations. Example: blessed-house-pv.",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) =>
        Rule.min(1)
          .unique()
          .custom(async (values, context) => {
            if (!Array.isArray(values) || values.length === 0) {
              return "Select at least one careers location";
            }
            const client = context.getClient({ apiVersion: "2025-08-01" });
            const catalog = (await client.fetch(CAREERS_LOCATION_QUERY)) ?? [];
            const allowed = new Set(
              catalog
                .map((row) =>
                  typeof row?.locationId === "string" ? row.locationId.trim() : ""
                )
                .filter(Boolean)
            );
            if (allowed.size === 0) {
              return "Add locations in System Settings → Careers locations first.";
            }
            const invalid = values.filter(
              (v) => typeof v === "string" && !allowed.has(v.trim())
            );
            if (invalid.length) {
              return `Unknown location id(s): ${invalid.join(", ")}.`;
            }
            return true;
          }),
    }),
    defineField({
      name: "commitments",
      title: "Commitments",
      type: "array",
      description:
        "Work schedule types for filters. Example: Full time and Seasonal together for a busy season hire.",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: JOB_COMMITMENT_OPTIONS,
      },
      validation: (Rule) => Rule.min(1).unique(),
    }),
    defineField({
      name: "jobTags",
      title: "Job tags",
      type: "array",
      description:
        "Optional tag IDs from System Settings → Job listing tags. Example: new or urgent.",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) =>
        Rule.max(5)
          .unique()
          .custom(async (values, context) => {
            if (!Array.isArray(values) || values.length === 0) return true;
            const client = context.getClient({ apiVersion: "2025-08-01" });
            const catalog = (await client.fetch(JOB_TAG_QUERY)) ?? [];
            const allowed = new Set(
              catalog
                .map((row) =>
                  typeof row?.tagId === "string" ? row.tagId.trim() : ""
                )
                .filter(Boolean)
            );
            if (allowed.size === 0) {
              return "Add tags in System Settings → Job listing tags first.";
            }
            const invalid = values.filter(
              (v) => typeof v === "string" && !allowed.has(v.trim())
            );
            if (invalid.length) {
              return `Unknown tag id(s): ${invalid.join(", ")}.`;
            }
            return true;
          }),
    }),
    ...localizedField({
      name: "description",
      title: "Description",
      type: "blockContent",
      description:
        "Full role description: duties, requirements, and how to thrive here. Example: Start with a short summary, then bullet responsibilities.",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "listed",
      title: "Listed on jobs page",
      type: "boolean",
      description:
        "When on, the role is public and accepts applications. Turn off to pause hiring without deleting. Example: off after the role is filled.",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "positionTitle",
      locations: "locationIds",
      listed: "listed",
    },
    prepare({ title, locations, listed }) {
      const locList = Array.isArray(locations)
        ? locations.filter(Boolean).join(", ")
        : "";
      return {
        title: title || "Untitled role",
        subtitle: `${listed ? "Listed" : "Hidden"}${locList ? ` · ${locList}` : ""}`,
      };
    },
  },
});
