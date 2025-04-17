import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';

import { NAMESPACE } from '../utils/constants';
import type { ResourceField } from '../utils/types';

import type { FieldSettings } from './types';

const sameOrderAndVisibility = (a: ResourceField[], b: ResourceField[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i += 1) {
    if (
      a[i]?.resourceFieldId !== b[i]?.resourceFieldId ||
      Boolean(a[i]?.isVisible) !== Boolean(b[i]?.isVisible)
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Keeps the list of fields. Toggles the visibility of the namespace field based on currently used namespace.
 *
 * User settings support:
 * 1. fields are loaded from user settings only during initialization
 * 2. saving fields to user settings is a side effect
 * 3. internal state maintained by the hook remains the single source of truth
 *
 * @param currentNamespace
 * @param defaultFields used for initialization
 * @param userSettings
 * @returns [fields, setFields]
 */
export const useFields = (
  currentNamespace: string,
  defaultFields: ResourceField[],
  userSettings?: FieldSettings,
): [ResourceField[], Dispatch<SetStateAction<ResourceField[]>>] => {
  const {
    clear: clearSettings = () => undefined,
    data: fieldsFromSettings = [],
    save: saveFieldsInSettings = () => undefined,
  } = userSettings || {};

  const [fields, setFields] = useState<ResourceField[]>(() => {
    const supportedIds: Record<string, ResourceField> = defaultFields.reduce(
      (acc, it) => ({ ...acc, [it.resourceFieldId]: it }),
      {},
    );
    const savedIds = new Set(fieldsFromSettings.map(({ resourceFieldId }) => resourceFieldId));
    // used to detect duplicates
    const idsToBeVisited = new Set(savedIds);

    const stateFields = [
      // put fields saved via user settings (if any)
      ...fieldsFromSettings
        // ignore duplicates:ID is removed from the helper map on the first visit
        .filter((it) => idsToBeVisited.delete(it.resourceFieldId))
        // ignore unsupported fields
        .filter(({ resourceFieldId }) => supportedIds[resourceFieldId])
        .map(({ isVisible, resourceFieldId }) => ({
          ...supportedIds[resourceFieldId],
          // keep the invariant that identity resourceFields are always visible
          isVisible: isVisible || supportedIds[resourceFieldId].isIdentity,
        })),
      // put all remaining fields (all fields if there are no settings)
      ...defaultFields
        .filter(({ resourceFieldId }) => !savedIds.has(resourceFieldId))
        .map((it) => ({ ...it })),
    ];

    return stateFields;
  });

  const namespaceAwareFields: ResourceField[] = useMemo(
    () =>
      fields.map(({ isVisible = false, resourceFieldId, ...rest }) => ({
        resourceFieldId,
        ...rest,
        isVisible: resourceFieldId === NAMESPACE ? !currentNamespace : isVisible,
      })),
    [currentNamespace, fields],
  );

  const setInternalStateAndSaveUserSettings = useMemo(
    () => (fields: ResourceField[]) => {
      setFields(fields);
      if (sameOrderAndVisibility(fields, defaultFields)) {
        // don't store settings if equal to default settings
        clearSettings();
      } else {
        saveFieldsInSettings(
          fields.map(({ isVisible, resourceFieldId }) => ({ isVisible, resourceFieldId })),
        );
      }
    },
    [setFields, saveFieldsInSettings],
  );

  return [namespaceAwareFields, setInternalStateAndSaveUserSettings];
};
