import type { MappingValue } from '@utils/types';

export const getNetworkSourceKey = (source: MappingValue): string | undefined => {
  const sourceId = source.id?.trim();
  if (sourceId) {
    return source.vlan ? `${sourceId}:vlan=${source.vlan}` : sourceId;
  }

  if (!source.name.trim()) {
    return undefined;
  }

  return source.vlan ? `${source.name}:vlan=${source.vlan}` : source.name;
};

export const isSameNetworkSource = (first: MappingValue, second: MappingValue): boolean => {
  const sameVlan =
    Boolean(first.vlan) === Boolean(second.vlan) && (!first.vlan || first.vlan === second.vlan);

  if (!sameVlan) {
    return false;
  }

  const firstId = first.id?.trim();
  const secondId = second.id?.trim();

  if (firstId && secondId) {
    return firstId === secondId;
  }

  return first.name === second.name;
};

type RefreshedMappings<T> = {
  hasUpdates: boolean;
  mappings: T[];
};

export const refreshNetworkSourceLabels = <T extends Record<string, unknown>>(
  mappings: T[],
  sourceField: string,
  usedSources: MappingValue[],
): RefreshedMappings<T> => {
  let hasUpdates = false;
  const updatedMappings = mappings.map((mapping) => {
    const mappedSource = mapping[sourceField] as MappingValue | undefined;
    const currentSource = usedSources.find(
      (usedSource) => mappedSource && isSameNetworkSource(mappedSource, usedSource),
    );

    if (!mappedSource || !currentSource) {
      return mapping;
    }

    const shouldUpdateId = !mappedSource.id?.trim() && Boolean(currentSource.id?.trim());
    if (mappedSource.name === currentSource.name && !shouldUpdateId) {
      return mapping;
    }

    hasUpdates = true;
    return {
      ...mapping,
      [sourceField]: {
        ...mappedSource,
        ...(shouldUpdateId ? { id: currentSource.id } : {}),
        name: currentSource.name,
      },
    };
  });

  return { hasUpdates, mappings: updatedMappings };
};
