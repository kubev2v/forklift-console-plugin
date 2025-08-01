import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { isEmpty } from '@utils/helpers';

import type { MappingValue } from '../types';

type MappingFieldIds = {
  sourceField: string;
  targetField: string;
  mapField: string;
};

type UseInitializeMappingsParams<T extends Record<string, unknown>> = {
  isLoading: boolean;
  currentMap: T[] | undefined;
  usedSources: MappingValue[];
  defaultTarget: MappingValue;
  fieldIds: MappingFieldIds;
  defaultTargetName?: string;
};

/**
 * Automatically creates mappings for unmapped sources by pairing them with default targets
 */
export const useInitializeMappings = <T extends Record<string, unknown>>({
  currentMap,
  defaultTarget,
  defaultTargetName,
  fieldIds,
  isLoading,
  usedSources,
}: UseInitializeMappingsParams<T>): void => {
  const { setValue } = useFormContext();

  useMemo(() => {
    // Ensure at least one empty mapping row exists for user input
    if (!currentMap?.length && !usedSources?.length) {
      const emptyMapping = {
        [fieldIds.sourceField]: { name: '' },
        [fieldIds.targetField]: {
          ...defaultTarget,
          name: defaultTargetName ?? defaultTarget.name,
        },
      };

      setValue(fieldIds.mapField, [emptyMapping]);
      return;
    }

    if (isLoading || isEmpty(usedSources)) {
      return;
    }

    const mappedSourceNames = new Set(
      (currentMap ?? [])
        .map((mapping) => {
          const sourceField = mapping[fieldIds.sourceField] as MappingValue | undefined;
          return sourceField?.name;
        })
        .filter((name): name is string => Boolean(name)),
    );

    const unmappedSources = usedSources.filter((source) => !mappedSourceNames.has(source.name));

    if (isEmpty(unmappedSources)) {
      return;
    }

    const newMappings = unmappedSources.map((source): T => {
      const targetValue: MappingValue = {
        ...defaultTarget,
        name: defaultTargetName ?? defaultTarget.name,
      };

      return {
        [fieldIds.sourceField]: source,
        [fieldIds.targetField]: targetValue,
      } as T;
    });

    setValue(fieldIds.mapField, [...(currentMap ?? []), ...newMappings]);
  }, [
    isLoading,
    currentMap,
    usedSources,
    defaultTarget,
    defaultTargetName,
    fieldIds.sourceField,
    fieldIds.targetField,
    fieldIds.mapField,
    setValue,
  ]);
};
