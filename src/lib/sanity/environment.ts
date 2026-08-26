function requireEnvironmentVariable(
  value: string | undefined,
  name: string,
): string {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new Error(`${name} is required.`);
  }

  return normalizedValue;
}

const projectId = requireEnvironmentVariable(
  import.meta.env.SANITY_PROJECT_ID,
  "SANITY_PROJECT_ID",
);
const dataset = requireEnvironmentVariable(
  import.meta.env.SANITY_DATASET,
  "SANITY_DATASET",
);

export { dataset, projectId };
