export const labelsToArray = (labels: Record<string, string> | undefined): string[] => {
  return Object.entries(labels ?? {}).map(([key, val]) => (val ? `${key}=${val}` : key));
};
