/**
 * Function to ensure that the input node is always an array.
 */
export const ensureArray = (node: unknown | unknown[]): unknown[] => {
  if (Array.isArray(node)) {
    return node;
  }
  return [node]; // Wrap the single ReactNode in an array
};
