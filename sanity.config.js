import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { sanityDataset, sanityProjectId } from "./sanity/env";
import { deskStructure } from "./sanity/deskStructure";
import { schemaTypes } from "./sanity/schemas";

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
  schema: {
    types: schemaTypes,
  },
});
