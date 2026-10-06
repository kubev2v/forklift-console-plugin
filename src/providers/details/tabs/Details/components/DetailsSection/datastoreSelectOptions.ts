import type { SelectOptionProps } from '@patternfly/react-core';

import { formatDatastoreWarnings, getDatastoreWarnings } from './getDatastoreWarnings';

type Translate = (key: string, params?: Record<string, string | number>) => string;

type VSphereDatastoreInventory = {
  accessible?: boolean;
  capacity: number;
  free: number;
  maintenance?: string;
  name: string;
};

const isVSphereDatastore = (storage: { name?: string }): storage is VSphereDatastoreInventory =>
  typeof storage.name === 'string' && 'capacity' in storage && 'free' in storage;

export const toDatastoreSelectOptions = (
  storages: { name?: string }[],
  t: Translate,
): SelectOptionProps[] =>
  storages
    .filter(isVSphereDatastore)
    .map((ds) => {
      const warnings = getDatastoreWarnings(ds);
      const description = formatDatastoreWarnings(warnings, t);
      const isInaccessible = warnings.some((warning) => warning.kind === 'inaccessible');
      return {
        children: ds.name,
        description: description || undefined,
        isDisabled: isInaccessible,
        itemId: ds.name,
      } satisfies SelectOptionProps;
    })
    .sort((a, b) => {
      const left = typeof a.itemId === 'string' ? a.itemId : '';
      const right = typeof b.itemId === 'string' ? b.itemId : '';
      return left.localeCompare(right);
    });

export const warningForDatastoreName = (
  storages: { name?: string }[],
  name: string,
  t: Translate,
): string | undefined => {
  const ds = storages.filter(isVSphereDatastore).find((item) => item.name === name);
  if (!ds) {
    return undefined;
  }
  const text = formatDatastoreWarnings(getDatastoreWarnings(ds), t);
  return text || undefined;
};
