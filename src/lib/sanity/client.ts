import { createClient } from "@sanity/client";

import { dataset, projectId } from "./environment";

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-26",
  useCdn: false,
});
