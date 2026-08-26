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
