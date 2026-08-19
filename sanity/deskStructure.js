const HIDDEN_TYPES = [
  "villa",
  "activity",
  "legendItem",
  "review",
  "blog",
  "blockContent",
  "homePageSettings",
  "aboutPageSettings",
  "contactPageSettings",
  "activitiesPageSettings",
  "blogPageSettings",
  "villasPageSettings",
];

export const deskStructure = (S) =>
  S.list()
    .title("BH Studio")
    .items([
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
