const HIDDEN_TYPES = [
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
  "activitiesPageSettings",
  "blogPageSettings",
  "villasPageSettings",
];

function formList(S, title, filter) {
  return S.documentTypeList("formSubmission")
    .title(title)
    .filter(filter)
    .defaultOrdering([{ field: "submittedAt", direction: "desc" }]);
}

export const deskStructure = (S) =>
  S.list()
    .title("BH Studio")
    .items([
      S.listItem()
        .title("Form Submissions")
        .child(
          S.list()
            .title("Form Submissions")
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
        .title("Property")
        .child(
          S.list()
            .title("Property")
            .items([
              S.documentTypeListItem("villa").title("Villas"),
              S.documentTypeListItem("activity").title("Activities"),
              S.documentTypeListItem("legendItem").title("Legend items"),
              S.documentTypeListItem("review").title("Reviews"),
            ])
        ),
      S.listItem()
        .title("Blog")
        .child(S.documentTypeList("blog").title("Blog posts")),
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
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !HIDDEN_TYPES.includes(item.getId())
      ),
    ]);
