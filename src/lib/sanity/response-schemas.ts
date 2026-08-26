import { z } from "zod";

const requiredTextSchema = z.string().trim().min(1);
const slugSchema = requiredTextSchema.regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "slug must contain lowercase letters, numbers, and single hyphens only",
);
const partialDateSchema = requiredTextSchema.regex(
  /^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/,
  "shotAt must use YYYY, YYYY-MM, or YYYY-MM-DD",
);
const nullableTextSchema = requiredTextSchema.nullable();

const sanityImageResponseSchema = z.strictObject({
  url: z.url({ protocol: /^https$/ }),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const sanityPhotoResponseSchema = z.strictObject({
  _id: requiredTextSchema,
  slug: slugSchema,
  image: sanityImageResponseSchema,
  title: requiredTextSchema,
  altText: requiredTextSchema,
  sortOrder: z.number().int().nonnegative(),
  caption: nullableTextSchema,
  location: nullableTextSchema,
  shotAt: partialDateSchema.nullable(),
  category: nullableTextSchema,
  albumId: nullableTextSchema,
});

export const sanityPhotosResponseSchema = z.array(sanityPhotoResponseSchema);

export const sanityLandingPageResponseSchema = z
  .strictObject({
    _id: z.literal("landingPage"),
    heroPhoto: sanityPhotoResponseSchema,
    storyPhotos: z.array(sanityPhotoResponseSchema).length(6),
  })
  .nullable();

export type SanityPhotoResponse = z.infer<typeof sanityPhotoResponseSchema>;
export type SanityPhotosResponse = z.infer<typeof sanityPhotosResponseSchema>;
export type SanityLandingPageResponse = z.infer<
  typeof sanityLandingPageResponseSchema
>;

export function parseSanityPhotosResponse(
  response: unknown,
): SanityPhotosResponse {
  return sanityPhotosResponseSchema.parse(response);
}

export function parseSanityLandingPageResponse(
  response: unknown,
): SanityLandingPageResponse {
  return sanityLandingPageResponseSchema.parse(response);
}
