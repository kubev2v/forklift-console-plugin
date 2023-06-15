import { useMemo, useState } from 'react';

import { NAMESPACE, ResourceField } from '../../utils';

import { FieldSettings } from './types';

const sameOrderAndVisibility = (a: ResourceField[], b: ResourceField[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
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
): [ResourceField[], React.Dispatch<React.SetStateAction<ResourceField[]>>] => {
  const {
    data: fieldsFromSettings = [],
    save: saveFieldsInSettings = () => undefined,
    clear: clearSettings = () => undefined,
  } = userSettings || {};

  const [fields, setFields] = useState<ResourceField[]>(() => {
    const supportedIds: { [id: string]: ResourceField } = defaultFields.reduce(
      (acc, it) => ({ ...acc, [it.resourceFieldId]: it }),
      {},
    );
    const savedIds = new Set(fieldsFromSettings.map(({ resourceFieldId }) => resourceFieldId));
    // used to detect duplicates
    const idsToBeVisited = new Set(savedIds);

    return [
      // put fields saved via user settings (if any)
      ...fieldsFromSettings
        // ignore duplicates:ID is removed from the helper map on the first visit
        .filter((it) => idsToBeVisited.delete(it.resourceFieldId))
        // ignore unsupported fields
        .filter(({ resourceFieldId }) => supportedIds[resourceFieldId])
        .map(({ resourceFieldId, isVisible }) => ({
          ...supportedIds[resourceFieldId],
          // keep the invariant that identity resourceFields are always visible
          isVisible: isVisible || supportedIds[resourceFieldId].isIdentity,
        })),
      // put all remaining fields (all fields if there are no settings)
      ...defaultFields
        .filter(({ resourceFieldId }) => !savedIds.has(resourceFieldId))
        .map((it) => ({ ...it })),
    ];
  });
  const namespaceAwareFields: ResourceField[] = useMemo(
    () =>
      fields.map(({ resourceFieldId, isVisible = false, ...rest }) => ({
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
          fields.map(({ resourceFieldId, isVisible }) => ({ resourceFieldId, isVisible })),
        );
      }
    },
    [setFields, saveFieldsInSettings],
  );

  return [namespaceAwareFields, setInternalStateAndSaveUserSettings];
};
