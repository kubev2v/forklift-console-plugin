import type { MappingFieldIds, MappingValue } from '../types';

type FillMappingsOptions<T> = {
  existingMappings: T[];
  unmappedSources: MappingValue[];
  targetValue: MappingValue;
  fieldIds: MappingFieldIds;
};

/**
 * Fills empty mapping rows with unmapped sources, then creates new mappings for remaining sources
 */
export const fillUnmappedSources = <T extends Record<string, unknown>>({
  existingMappings,
  fieldIds,
  targetValue,
  unmappedSources,
}: FillMappingsOptions<T>): T[] => {
  // Fill empty rows with unmapped sources
  let sourceIndex = 0;
  const updatedMappings = existingMappings.map((mapping) => {
    const sourceField = mapping[fieldIds.sourceField] as MappingValue | undefined;
    const isEmptyRow = !sourceField?.name?.trim();

    if (isEmptyRow && sourceIndex < unmappedSources.length) {
      const filledMapping = {
        ...mapping,
        [fieldIds.sourceField]: unmappedSources[sourceIndex],
      } as T;
      sourceIndex += 1;
      return filledMapping;
    }

    return mapping;
  });

  // Create new mappings for any remaining sources
  const remainingSources = unmappedSources.slice(sourceIndex);
  const newMappings = remainingSources.map(
    (source): T =>
      ({
        [fieldIds.sourceField]: source,
        [fieldIds.targetField]: targetValue,
      }) as T,
  );

  return [...updatedMappings, ...newMappings];
};
