function requireEnvironmentVariable(
  value: string | undefined,
  name: string,
): string {
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

const projectId = requireEnvironmentVariable(
  process.env.SANITY_STUDIO_PROJECT_ID,
  "SANITY_STUDIO_PROJECT_ID",
);
const dataset = requireEnvironmentVariable(
  process.env.SANITY_STUDIO_DATASET,
  "SANITY_STUDIO_DATASET",
);

export { dataset, projectId };
