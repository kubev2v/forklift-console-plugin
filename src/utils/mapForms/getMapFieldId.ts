/**
 * Creates a field ID for a map resource mapping at a specific index
 * Used for form field identification and validation
 */
export const getMapFieldId = (mapFieldId: string, id: string, index: number): string =>
  `${mapFieldId}.${index}.${id}`;
