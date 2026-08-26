import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { dataset, projectId } from "./environment";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "default",
  title: "Justyes Gallery",
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
