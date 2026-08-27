import { createClient } from "@sanity/client";

import { dataset, projectId, readToken } from "./environment";

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-26",
  perspective: "published",
  token: readToken,
  useCdn: false,
});
