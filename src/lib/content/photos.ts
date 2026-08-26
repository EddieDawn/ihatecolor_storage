import { adaptSanityPhotos } from "../sanity/photo-adapter";
import { fetchAllPhotosFromSanity } from "../sanity/fetch";
import { parseSanityPhotosResponse } from "../sanity/response-schemas";
import type { Photo } from "./photo-model";

export type { Photo } from "./photo-model";

function assertUniqueField(
  photos: readonly Photo[],
  field: "id" | "slug",
): void {
  const seen = new Set<string | number>();

  for (const photo of photos) {
    const value = photo[field];

    if (seen.has(value)) {
      throw new Error(`Duplicate Photo.${field}: ${String(value)}`);
    }

    seen.add(value);
  }
}

export function validateAndSortPhotos(photos: readonly Photo[]): Photo[] {
  assertUniqueField(photos, "id");
  assertUniqueField(photos, "slug");

  return [...photos].sort(
    (left, right) =>
      right.sortOrder - left.sortOrder || left.id.localeCompare(right.id),
  );
}

export async function getPhotos(): Promise<Photo[]> {
  const response = await fetchAllPhotosFromSanity();
  const validatedPhotos = parseSanityPhotosResponse(response);
  const photos = adaptSanityPhotos(validatedPhotos);

  return validateAndSortPhotos(photos);
}
