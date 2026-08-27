import process from "node:process";

import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  image: {
    domains: ["cdn.sanity.io"],
  },
  server: {
    host: true,
  },
  vite: {
    server: {
      watch: {
        usePolling: process.env.CHOKIDAR_USEPOLLING === "true",
        interval: Number(process.env.CHOKIDAR_INTERVAL ?? 100),
        ignored: [
          "**/.astro/**",
          "**/.pnpm-store/**",
          "**/dist/**",
          "**/studio/**",
        ],
      },
    },
  },
});
