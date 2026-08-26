import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { dataset, projectId } from "./environment";
import { LANDING_PAGE_SCHEMA_TYPE } from "./schemaTypes/landingPageType";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

const singletonActions = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig({
  name: "default",
  title: "Justyes Gallery",
  projectId,
  dataset,
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(
        (template) => template.schemaType !== LANDING_PAGE_SCHEMA_TYPE,
      ),
  },
  document: {
    actions: (actions, context) =>
      context.schemaType === LANDING_PAGE_SCHEMA_TYPE
        ? actions.filter(
            (action) => action.action && singletonActions.has(action.action),
          )
        : actions,
  },
});
