import { getCollection, type CollectionEntry } from "astro:content";

export type Photo = CollectionEntry<"photos">["data"];
export type PhotoStatus = Photo["status"];

export interface GetPhotosOptions {
  status?: PhotoStatus | "all";
}

function assertUniqueField(
  photos: readonly Photo[],
  field: "id" | "slug" | "sortOrder",
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
  assertUniqueField(photos, "sortOrder");

  return [...photos].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.id.localeCompare(right.id),
  );
}

export async function getPhotos({
  status = "published",
}: GetPhotosOptions = {}): Promise<Photo[]> {
  const entries = await getCollection("photos");
  const photos = validateAndSortPhotos(entries.map(({ data }) => data));

  if (status === "all") {
    return photos;
  }

  return photos.filter((photo) => photo.status === status);
}
