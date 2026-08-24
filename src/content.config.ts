import { defineCollection, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const requiredText = z.string().trim().min(1);
const slug = requiredText.regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "slug must contain lowercase letters, numbers, and single hyphens only",
);
const partialDate = requiredText.regex(
  /^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/,
  "shotAt must use YYYY, YYYY-MM, or YYYY-MM-DD",
);

export const photoSchema = ({ image }: SchemaContext) =>
  z
    .object({
      id: requiredText,
      slug,
      image: image(),
      title: requiredText,
      altText: requiredText,
      status: z.enum(["draft", "published"]),
      sortOrder: z.number().int().nonnegative(),
      caption: requiredText.optional(),
      location: requiredText.optional(),
      shotAt: partialDate.optional(),
      category: requiredText.optional(),
      albumId: requiredText.optional(),
    })
    .strict();

const photos = defineCollection({
  loader: glob({
    base: "./src/data/photos",
    pattern: "**/index.md",
  }),
  schema: photoSchema,
});

export const collections = { photos };

//현재 로컬을 CMS처럼 사용하기 위한 코드입니다!
