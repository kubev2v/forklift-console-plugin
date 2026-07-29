export const labelsArrayToObject = (labels: string[]): Record<string, string | null> => {
  const result: Record<string, string | null> = {};
  for (const item of labels) {
    const [key, value = null] = item.split('=');
    result[key] = value;
  }
  return result;
};
