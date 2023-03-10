import { useMemo, useState } from 'react';
import { NAMESPACE } from 'common/src/utils/constants';

import { ResourceField } from '../types';

import { FieldSettings } from './types';

const sameOrderAndVisibility = (a: ResourceField[], b: ResourceField[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (
      a[i]?.resourceFieldID !== b[i]?.resourceFieldID ||
      Boolean(a[i]?.isVisible) !== Boolean(b[i]?.isVisible)
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Keeps the list of fields. Toggles the visibility of the namespace field based on currently used namspace.
 *
 * User settings support:
 * 1. fields are loaded from user settings only during intialization
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
      (acc, it) => ({ ...acc, [it.resourceFieldID]: it }),
      {},
    );
    const savedIds = new Set(fieldsFromSettings.map(({ resourceFieldID }) => resourceFieldID));
    // used to detect duplicates
    const idsToBeVisited = new Set(savedIds);

    return [
      // put fields saved via user settings (if any)
      ...fieldsFromSettings
        // ignore duplicates:ID is removed from the helper map on the first visit
        .filter((it) => idsToBeVisited.delete(it.resourceFieldID))
        // ignore unsupported fields
        .filter(({ resourceFieldID }) => supportedIds[resourceFieldID])
        .map(({ resourceFieldID, isVisible }) => ({
          ...supportedIds[resourceFieldID],
          // keep the invariant that identity resourceFields are always visible
          isVisible: isVisible || supportedIds[resourceFieldID].isIdentity,
        })),
      // put all remaining fields (all fields if there are no settings)
      ...defaultFields
        .filter(({ resourceFieldID }) => !savedIds.has(resourceFieldID))
        .map((it) => ({ ...it })),
    ];
  });
  const namespaceAwareFields: ResourceField[] = useMemo(
    () =>
      fields.map(({ resourceFieldID, isVisible = false, ...rest }) => ({
        resourceFieldID,
        ...rest,
        isVisible: resourceFieldID === NAMESPACE ? !currentNamespace : isVisible,
      })),
    [currentNamespace, fields],
  );

  const setInternalStateAndSaveUserSettings = useMemo(
    () => (fields: ResourceField[]) => {
      setFields(fields);
      if (sameOrderAndVisibility(fields, defaultFields)) {
        // don't store settings if equal to deault settings
        clearSettings();
      } else {
        saveFieldsInSettings(
          fields.map(({ resourceFieldID, isVisible }) => ({ resourceFieldID, isVisible })),
        );
      }
    },
    [setFields, saveFieldsInSettings],
  );

  return [namespaceAwareFields, setInternalStateAndSaveUserSettings];
};
