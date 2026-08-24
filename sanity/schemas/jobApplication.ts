import { defineField, defineType } from "sanity";

export const JOB_APPLICATION_STATUSES = [
  { title: "New", value: "new" },
  { title: "Reviewed", value: "reviewed" },
  { title: "Archived", value: "archived" },
];

export const jobApplication = defineType({
  name: "jobApplication",
  title: "Job application",
  type: "document",
  description:
    "Submitted careers application with resume asset. Triage in Careers Data: New → Reviewed → Archived.",
  fields: [
    defineField({
      name: "firstName",
      title: "First name",
      type: "string",
      description: "Applicant first name from the form. Example: Ana.",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "lastName",
      title: "Last name",
      type: "string",
      description: "Applicant last name from the form. Example: Rivera.",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "Reply to address for interviews. Example: ana.rivera@example.com.",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      description: "Optional phone with country code. Example: +506 7000 1234.",
    }),
    defineField({
      name: "resume",
      title: "Resume / CV",
      type: "file",
      description:
        "Uploaded resume asset (PDF, DOC, or DOCX, max 24 MB). Open the file to review before changing status.",
      options: { accept: ".pdf,.doc,.docx" },
    }),
    defineField({
      name: "jobPosting",
      title: "Job posting",
      type: "reference",
      description:
        "Role the applicant applied for. Example: Front desk associate. Weak ref so the application remains if the posting is deleted.",
      to: [{ type: "jobPosting" }],
      weak: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description:
        "Triage state for the hiring inbox. Example: leave as New until someone opens the resume, then mark Reviewed.",
      options: {
        list: JOB_APPLICATION_STATUSES,
        layout: "radio",
      },
      initialValue: "new",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted at",
      type: "datetime",
      description: "When the application arrived. Set automatically by the careers API.",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
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
      firstName: "firstName",
      lastName: "lastName",
      email: "email",
      jobTitle: "jobPosting.positionTitle",
      status: "status",
    },
    prepare({ firstName, lastName, email, jobTitle, status }) {
      const name =
        [firstName, lastName].filter(Boolean).join(" ").trim() ||
        email ||
        "Applicant";
      return {
        title: name,
        subtitle: `${jobTitle || "Role"} · ${status || "new"}`,
      };
    },
  },
});
