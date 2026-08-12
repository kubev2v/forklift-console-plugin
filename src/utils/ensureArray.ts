/**
 * Function to ensure that the input node is always an array.
 * @param node
 */
export const ensureArray = (node: unknown): unknown[] => {
  if (Array.isArray(node)) {
    return node;
  }
  return [node]; // Wrap the single ReactNode in an array
};
