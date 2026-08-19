export const photoScenarioNames = [
  "all",
  "empty",
  "single",
  "pagination-boundary",
] as const;

export type PhotoScenarioName = (typeof photoScenarioNames)[number];

export interface PhotoScenarioOptions {
  pageSize?: number;
}

function requireFirstItem<T>(items: readonly T[]): T {
  const firstItem = items[0];

  if (firstItem === undefined) {
    throw new Error("The single-photo scenario requires at least one item.");
  }

  return firstItem;
}

function requirePaginationBoundary<T>(
  items: readonly T[],
  pageSize: number | undefined,
): T[] {
  if (!Number.isInteger(pageSize) || pageSize === undefined || pageSize < 1) {
    throw new Error(
      "The pagination-boundary scenario requires a positive integer pageSize.",
    );
  }

  const requiredItemCount = pageSize + 1;

  if (items.length < requiredItemCount) {
    throw new Error(
      `The pagination-boundary scenario requires ${requiredItemCount} items, but received ${items.length}.`,
    );
  }

  return items.slice(0, requiredItemCount);
}

export function selectPhotoScenario<T>(
  items: readonly T[],
  scenario: PhotoScenarioName,
  { pageSize }: PhotoScenarioOptions = {},
): T[] {
  switch (scenario) {
    case "all":
      return [...items];
    case "empty":
      return [];
    case "single":
      return [requireFirstItem(items)];
    case "pagination-boundary":
      return requirePaginationBoundary(items, pageSize);
  }
}
