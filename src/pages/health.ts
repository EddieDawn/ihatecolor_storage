import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response("ihatecolor_storage development environment is ready.\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
