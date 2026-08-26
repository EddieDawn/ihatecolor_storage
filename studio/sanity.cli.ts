import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./environment";

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  server: {
    hostname: "0.0.0.0",
    port: 3333,
  },
});
