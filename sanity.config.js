import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { sanityDataset, sanityProjectId } from "./sanity/env";
import { deskStructure } from "./sanity/deskStructure";
import { schemaTypes } from "./sanity/schemas";
import { TranslateCaptionsAction } from "./sanity/actions/translateCaptionsAction";

export default defineConfig({
  name: "bh-studio",
  title: "BH Studio",
  projectId: sanityProjectId,
  dataset: sanityDataset,
  basePath: "/admin",
  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool(),
  ],
  document: {
    actions: (previous, context) => {
      if (context.schemaType !== "property") return previous;
      const actions = [];
      let placed = false;
      for (const action of previous) {
        actions.push(action);
        if (action.action === "publish") {
          actions.push(TranslateCaptionsAction);
          placed = true;
        }
      }
      if (!placed) actions.push(TranslateCaptionsAction);
      return actions;
    },
  },
  schema: {
    types: schemaTypes,
  },
});
