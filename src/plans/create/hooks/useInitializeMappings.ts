import { useEffect, useMemo, useRef } from 'react';
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
  const hasInitializedRef = useRef(false);
  const autoMappedSourcesRef = useRef(new Set<string>());

  const mappedSourceNames = useMemo(() => {
    if (!currentMap?.length) return new Set<string>();

    return new Set(
      currentMap
        .map((mapping) => {
          const sourceField = mapping[fieldIds.sourceField] as MappingValue | undefined;
          return sourceField?.name;
        })
        .filter((name): name is string => Boolean(name?.trim())),
    );
  }, [currentMap, fieldIds.sourceField]);

  const unmappedSources = useMemo(() => {
    if (isEmpty(usedSources)) {
      return [];
    }

    return usedSources.filter(
      (source) =>
        source.name?.trim() &&
        !mappedSourceNames.has(source.name) &&
        !autoMappedSourcesRef.current.has(source.name),
    );
  }, [usedSources, mappedSourceNames]);

  const targetValue = useMemo(
    (): MappingValue => ({
      ...defaultTarget,
      name: defaultTargetName ?? defaultTarget.name,
    }),
    [defaultTarget, defaultTargetName],
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!currentMap?.length && !usedSources?.length && !hasInitializedRef.current) {
      const emptyMapping = {
        [fieldIds.sourceField]: { name: '' },
        [fieldIds.targetField]: targetValue,
      };

      setValue(fieldIds.mapField, [emptyMapping]);
      hasInitializedRef.current = true;
      return;
    }

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
    }

    if (!isEmpty(unmappedSources)) {
      const newMappings = unmappedSources.map(
        (source): T =>
          ({
            [fieldIds.sourceField]: source,
            [fieldIds.targetField]: targetValue,
          }) as T,
      );

      setValue(fieldIds.mapField, [...(currentMap ?? []), ...newMappings]);

      unmappedSources.forEach((source) => {
        if (source.name) {
          autoMappedSourcesRef.current.add(source.name);
        }
      });
    }
  }, [
    isLoading,
    unmappedSources,
    targetValue,
    fieldIds.mapField,
    fieldIds.sourceField,
    fieldIds.targetField,
    setValue,
    currentMap,
    usedSources?.length,
  ]);
};
