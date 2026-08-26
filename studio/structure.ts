import type { StructureResolver } from "sanity/structure";

import {
  LANDING_PAGE_DOCUMENT_ID,
  LANDING_PAGE_SCHEMA_TYPE,
} from "./schemaTypes/landingPageType";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .id(LANDING_PAGE_DOCUMENT_ID)
        .title("Landing page")
        .child(
          S.document()
            .schemaType(LANDING_PAGE_SCHEMA_TYPE)
            .documentId(LANDING_PAGE_DOCUMENT_ID),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== LANDING_PAGE_SCHEMA_TYPE,
      ),
    ]);
