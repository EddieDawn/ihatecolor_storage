export const PHOTO_PAGE_SIZE = 9;

export function getPhotoPageCount(totalItems: number): number {
  return Math.max(1, Math.ceil(totalItems / PHOTO_PAGE_SIZE));
}

export function getPhotoPageItems<T>(
  items: readonly T[],
  page: number,
): T[] {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`Photo page must be a positive integer: ${String(page)}`);
  }

  const start = (page - 1) * PHOTO_PAGE_SIZE;
  return items.slice(start, start + PHOTO_PAGE_SIZE);
}

export function getPhotoPageHref(page: number): string {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`Photo page must be a positive integer: ${String(page)}`);
  }

  return page === 1 ? "/photos/" : `/photos/page/${page}/`;
}
