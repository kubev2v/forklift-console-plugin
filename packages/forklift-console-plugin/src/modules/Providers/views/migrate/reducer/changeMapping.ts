import { Mapping, MappingSource } from '../types';

export const addMapping = (sources: MappingSource[], targets: string[], mappings: Mapping[]) => {
  const firstUsedByVms = sources.find(
    ({ usedBySelectedVms, isMapped }) => usedBySelectedVms && !isMapped,
  );
  const firstGeneral = sources.find(
    ({ usedBySelectedVms, isMapped }) => !usedBySelectedVms && !isMapped,
  );
  const nextSource = firstUsedByVms || firstGeneral;
  const nextDest = targets[0];

  return nextDest && nextSource
    ? {
        sources: sources.map((m) => ({
          ...m,
          isMapped: m.label === nextSource.label ? true : m.isMapped,
        })),
        mappings: [...mappings, { source: nextSource.label, destination: nextDest }],
      }
    : {};
};

export const deleteMapping = (
  sources: MappingSource[],
  selectedSource: string,
  mappings: Mapping[],
) => {
  const currentSource = sources.find(({ label, isMapped }) => label === selectedSource && isMapped);

  return currentSource
    ? {
        sources: sources.map((m) => ({
          ...m,
          isMapped: m.label === selectedSource ? false : m.isMapped,
        })),
        mappings: mappings.filter(({ source }) => source !== currentSource.label),
      }
    : {};
};

export const replaceMapping = (
  sources: MappingSource[],
  current: Mapping,
  next: Mapping,
  targets: string[],
  mappings: Mapping[],
) => {
  const currentSource = sources.find(({ label, isMapped }) => label === current.source && isMapped);
  const nextSource = sources.find(({ label }) => label === next.source);
  const nextDest = targets.find((label) => label === next.destination);
  const sourceChanged = currentSource.label !== nextSource.label;
  const destinationChanged = current.destination !== nextDest;

  if (!currentSource || !nextSource || !nextDest || (!sourceChanged && !destinationChanged)) {
    return;
  }

  const updatedSources = sourceChanged
    ? sources.map((m) => ({
        ...m,
        isMapped: [currentSource.label, nextSource.label].includes(m.label)
          ? !m.isMapped
          : m.isMapped,
      }))
    : undefined;

  return {
    sources: updatedSources,
    mappings: updateMappingsIfNeeded(mappings, current.source, next),
  };
};

const updateMappingsIfNeeded = (mappings, currentSource, next) => {
  const mappingIndex = mappings.findIndex(({ source }) => source === currentSource);
  if (mappingIndex < 0) {
    return undefined;
  }
  const updatedMappings = [...mappings];
  updatedMappings.splice(mappingIndex, 1, next);
  return updatedMappings;
};
