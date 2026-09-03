import { OwnerCalendar } from "./components/OwnerCalendar";

const SYSTEM_SETTINGS_ID = "systemSettings";
const JOBS_PAGE_ID = "jobsPage";

const HIDDEN_FROM_DEFAULT = [
  "villa",
  "activity",
  "legendItem",
  "review",
  "blog",
  "formSubmission",
  "blockContent",
  "homePageSettings",
  "aboutPageSettings",
  "contactPageSettings",
  "galleryPageSettings",
  "activitiesPageSettings",
  "blogPageSettings",
  "villasPageSettings",
  "property",
  "propertyKind",
  "location",
  "roomType",
  "blockedDate",
  "stayBooking",
  "systemSettings",
  "jobsPage",
  "jobPosting",
  "jobApplication",
];

function formList(S, title, filter) {
  return S.documentTypeList("formSubmission")
    .title(title)
    .filter(filter)
    .defaultOrdering([{ field: "submittedAt", direction: "desc" }]);
}

function bookingList(S, title, filter) {
  return S.documentTypeList("stayBooking")
    .title(title)
    .filter(filter)
    .defaultOrdering([{ field: "checkIn", direction: "asc" }]);
}

function applicationList(S, title, filter) {
  return S.documentTypeList("jobApplication")
    .title(title)
    .filter(filter)
    .defaultOrdering([{ field: "submittedAt", direction: "desc" }]);
}

export const deskStructure = (S) =>
  S.list()
    .title("BH Studio")
    .items([
      S.listItem()
        .title("System Settings")
        .id(SYSTEM_SETTINGS_ID)
        .child(
          S.document()
            .schemaType("systemSettings")
            .documentId(SYSTEM_SETTINGS_ID)
            .title("System Settings")
        ),

      S.divider(),

      S.listItem()
        .title("Calendar")
        .id("owner-calendar-root")
        .child(
          S.list()
            .title("Calendar")
            .items([
              S.listItem()
                .title("Month view")
                .id("owner-calendar-month")
                .child(
                  S.component(OwnerCalendar)
                    .id("owner-calendar-view")
                    .title("Owner calendar")
                ),
              S.listItem()
                .title("Blocked dates")
                .schemaType("blockedDate")
                .child(
                  S.documentTypeList("blockedDate")
                    .title("Blocked dates")
                    .defaultOrdering([{ field: "startDate", direction: "asc" }])
                ),
              S.listItem()
                .title("Reservations")
                .id("calendar-reservations")
                .child(
                  S.list()
                    .title("Reservations")
                    .items([
                      S.listItem()
                        .title("All")
                        .child(
                          bookingList(S, "All bookings", `_type == "stayBooking"`)
                        ),
                      S.listItem()
                        .title("Pending")
                        .child(
                          bookingList(
                            S,
                            "Pending",
                            `_type == "stayBooking" && paymentStatus == "pending"`
                          )
                        ),
                      S.listItem()
                        .title("Paid / confirmed")
                        .child(
                          bookingList(
                            S,
                            "Paid bookings",
                            `_type == "stayBooking" && paymentStatus == "paid"`
                          )
                        ),
                      S.listItem()
                        .title("Failed / cancelled")
                        .child(
                          bookingList(
                            S,
                            "Failed or cancelled",
                            `_type == "stayBooking" && paymentStatus in ["failed", "cancelled", "refunded"]`
                          )
                        ),
                    ])
                ),
            ])
        ),

      S.listItem()
        .title("Properties")
        .schemaType("property")
        .child(
          S.documentTypeList("property")
            .title("Properties")
            .defaultOrdering([{ field: "name", direction: "asc" }])
        ),

      S.divider(),

      S.listItem()
        .title("Form Submissions")
        .child(
          S.list()
            .title("Form Submissions / Inbox")
            .items([
              S.listItem()
                .title("All (newest first)")
                .child(
                  formList(S, "All submissions", `_type == "formSubmission"`)
                ),
              S.listItem()
                .title("Needs Review")
                .child(
                  formList(
                    S,
                    "Needs Review",
                    `_type == "formSubmission" && status == "needsReview"`
                  )
                ),
              S.divider(),
              S.listItem()
                .title("Guest experiences")
                .child(
                  formList(
                    S,
                    "Guest experiences",
                    `_type == "formSubmission" && formType == "guestExperience"`
                  )
                ),
              S.listItem()
                .title("Villa comments")
                .child(
                  formList(
                    S,
                    "Villa comments",
                    `_type == "formSubmission" && formType == "villaComment"`
                  )
                ),
              S.listItem()
                .title("Contact messages")
                .child(
                  formList(
                    S,
                    "Contact messages",
                    `_type == "formSubmission" && formType == "contact"`
                  )
                ),
            ])
        ),

      S.listItem()
        .title("Careers Data")
        .id("careers-data-root")
        .child(
          S.list()
            .title("Careers Data")
            .items([
              S.listItem()
                .title("Jobs page")
                .id(JOBS_PAGE_ID)
                .child(
                  S.document()
                    .schemaType("jobsPage")
                    .documentId(JOBS_PAGE_ID)
                    .title("Jobs page")
                ),
              S.listItem()
                .title("Job postings")
                .schemaType("jobPosting")
                .child(
                  S.documentTypeList("jobPosting")
                    .title("Job postings")
                    .defaultOrdering([{ field: "positionTitle", direction: "asc" }])
                ),
              S.listItem()
                .title("Applications")
                .id("job-applications-root")
                .child(
                  S.list()
                    .title("Applications")
                    .items([
                      S.listItem()
                        .title("All")
                        .child(
                          applicationList(
                            S,
                            "All applications",
                            `_type == "jobApplication"`
                          )
                        ),
                      S.listItem()
                        .title("New")
                        .child(
                          applicationList(
                            S,
                            "New",
                            `_type == "jobApplication" && status == "new"`
                          )
                        ),
                      S.listItem()
                        .title("Reviewed")
                        .child(
                          applicationList(
                            S,
                            "Reviewed",
                            `_type == "jobApplication" && status == "reviewed"`
                          )
                        ),
                      S.listItem()
                        .title("Archived")
                        .child(
                          applicationList(
                            S,
                            "Archived",
                            `_type == "jobApplication" && status == "archived"`
                          )
                        ),
                    ])
                ),
            ])
        ),

      S.divider(),

      S.listItem()
        .title("Site content")
        .child(
          S.list()
            .title("Site content")
            .items([
              S.listItem()
                .title("Marketing villas (legacy)")
                .child(S.documentTypeList("villa").title("Villas")),
              S.documentTypeListItem("activity").title("Activities"),
              S.documentTypeListItem("legendItem").title("Legend items"),
              S.documentTypeListItem("review").title("Reviews"),
              S.documentTypeListItem("blog").title("Blog"),
              S.listItem()
                .title("Site Pages")
                .child(
                  S.list()
                    .title("Site Pages")
                    .items([
                      S.listItem()
                        .title("Homepage")
                        .child(
                          S.document()
                            .schemaType("homePageSettings")
                            .documentId("homePageSettings")
                        ),
                      S.listItem()
                        .title("About")
                        .child(
                          S.document()
                            .schemaType("aboutPageSettings")
                            .documentId("aboutPageSettings")
                        ),
                      S.listItem()
                        .title("Contact")
                        .child(
                          S.document()
                            .schemaType("contactPageSettings")
                            .documentId("contactPageSettings")
                        ),
                      S.listItem()
                        .title("Gallery")
                        .child(
                          S.document()
                            .schemaType("galleryPageSettings")
                            .documentId("galleryPageSettings")
                        ),
                      S.listItem()
                        .title("Villas")
                        .child(
                          S.document()
                            .schemaType("villasPageSettings")
                            .documentId("villasPageSettings")
                        ),
                      S.listItem()
                        .title("Activities")
                        .child(
                          S.document()
                            .schemaType("activitiesPageSettings")
                            .documentId("activitiesPageSettings")
                        ),
                      S.listItem()
                        .title("Blog")
                        .child(
                          S.document()
                            .schemaType("blogPageSettings")
                            .documentId("blogPageSettings")
                        ),
                    ])
                ),
            ])
        ),

      S.listItem()
        .title("Catalog (developer)")
        .id("developer-catalog")
        .child(
          S.list()
            .title("Catalog")
            .items([
              S.documentTypeListItem("propertyKind").title("Property types"),
              S.documentTypeListItem("location").title("Locations"),
              S.documentTypeListItem("roomType").title("Room / space types"),
            ])
        ),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (item) => !HIDDEN_FROM_DEFAULT.includes(item.getId())
      ),
    ]);
