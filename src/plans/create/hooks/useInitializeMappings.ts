import { useEffect, useMemo, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { isEmpty } from '@utils/helpers';
import type { MappingValue } from '@utils/types';

import type { MappingFieldIds } from '../types';
import { fillUnmappedSources } from '../utils/fillUnmappedSources';

type UseInitializeMappingsParams<T extends Record<string, unknown>> = {
  currentMap: T[] | undefined;
  defaultTarget: MappingValue;
  defaultTargetName?: string;
  fieldIds: MappingFieldIds;
  isLoading: boolean;
  usedSources: MappingValue[];
};

const getSourceKey = (source: MappingValue): string | undefined => {
  if (source.vlan) {
    return `${source.id ?? source.name}:vlan=${source.vlan}`;
  }

  return source.id?.trim() ? source.id : source.name;
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
  const { clearErrors, setValue, trigger } = useFormContext();
  const hasInitializedRef = useRef(false);
  const autoMappedSourcesRef = useRef(new Set<string>());

  const mappedSourceKeys = useMemo(() => {
    if (!currentMap?.length) {
      return new Set<string>();
    }

    return new Set(
      currentMap
        .map((mapping) => {
          const sourceField = mapping[fieldIds.sourceField] as MappingValue | undefined;
          return sourceField ? getSourceKey(sourceField) : undefined;
        })
        .filter((key): key is string => Boolean(key?.trim())),
    );
  }, [currentMap, fieldIds.sourceField]);

  const unmappedSources = useMemo(() => {
    if (isEmpty(usedSources)) {
      return [];
    }

    return usedSources.filter(
      (source) =>
        source.name?.trim() &&
        !mappedSourceKeys.has(getSourceKey(source) ?? '') &&
        !autoMappedSourcesRef.current.has(getSourceKey(source) ?? ''),
    );
  }, [usedSources, mappedSourceKeys]);

  const targetValue = useMemo(
    (): MappingValue => ({
      ...defaultTarget,
      name: defaultTargetName ?? defaultTarget.name,
    }),
    [defaultTarget, defaultTargetName],
  );

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (isLoading) {
      return undefined;
    }

    if (!currentMap?.length && !usedSources?.length && !hasInitializedRef.current) {
      const emptyMapping = {
        [fieldIds.sourceField]: { name: '' },
        [fieldIds.targetField]: targetValue,
      };

      setValue(fieldIds.mapField, [emptyMapping], { shouldDirty: true, shouldValidate: true });
      hasInitializedRef.current = true;
      return undefined;
    }

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
    }

    if (!isEmpty(unmappedSources)) {
      clearErrors(fieldIds.mapField);

      const existingMappings = [...(currentMap ?? [])];
      const updatedMappings = fillUnmappedSources({
        existingMappings,
        fieldIds,
        targetValue,
        unmappedSources,
      });

      setValue(fieldIds.mapField, updatedMappings, { shouldDirty: true, shouldValidate: true });

      // Trigger validation to ensure form state is correct
      timeoutId = setTimeout(() => {
        trigger().catch(() => undefined);
      }, 0);

      for (const source of unmappedSources) {
        const sourceKey = getSourceKey(source);
        if (sourceKey) {
          autoMappedSourcesRef.current.add(sourceKey);
        }
      }
    }

    return (): void => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    isLoading,
    unmappedSources,
    targetValue,
    fieldIds,
    setValue,
    trigger,
    clearErrors,
    currentMap,
    usedSources?.length,
  ]);
};
