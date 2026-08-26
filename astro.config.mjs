import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
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
