import { useMemo, useState } from 'react';
import { NAMESPACE } from 'common/src/utils/constants';

import { Field } from '../types';

import { FieldSettings } from './types';

const sameOrderAndVisibility = (a: Field[], b: Field[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i]?.id !== b[i]?.id || Boolean(a[i]?.isVisible) !== Boolean(b[i]?.isVisible)) {
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
  defaultFields: Field[],
  userSettings?: FieldSettings,
): [Field[], React.Dispatch<React.SetStateAction<Field[]>>] => {
  const {
    data: fieldsFromSettings = [],
    save: saveFieldsInSettings = () => undefined,
    clear: clearSettings = () => undefined,
  } = userSettings || {};

  const [fields, setFields] = useState<Field[]>(() => {
    const supportedIds: { [id: string]: Field } = defaultFields.reduce(
      (acc, it) => ({ ...acc, [it.id]: it }),
      {},
    );
    const savedIds = new Set(fieldsFromSettings.map(({ id }) => id));
    // used to detect duplicates
    const idsToBeVisited = new Set(savedIds);

    return [
      // put fields saved via user settings (if any)
      ...fieldsFromSettings
        // ignore duplicates:ID is removed from the helper map on the first visit
        .filter((it) => idsToBeVisited.delete(it.id))
        // ignore unsupported fields
        .filter(({ id }) => supportedIds[id])
        .map(({ id, isVisible }) => ({
          ...supportedIds[id],
          // keep the invariant that identity columns are always visible
          isVisible: isVisible || supportedIds[id].isIdentity,
        })),
      // put all remaining fields (all fields if there are no settings)
      ...defaultFields.filter(({ id }) => !savedIds.has(id)).map((it) => ({ ...it })),
    ];
  });
  const namespaceAwareFields: Field[] = useMemo(
    () =>
      fields.map(({ id, isVisible = false, ...rest }) => ({
        id,
        ...rest,
        isVisible: id === NAMESPACE ? !currentNamespace : isVisible,
      })),
    [currentNamespace, fields],
  );

  const setInternalStateAndSaveUserSettings = useMemo(
    () => (fields: Field[]) => {
      setFields(fields);
      if (sameOrderAndVisibility(fields, defaultFields)) {
        // don't store settings if equal to deault settings
        clearSettings();
      } else {
        saveFieldsInSettings(fields.map(({ id, isVisible }) => ({ id, isVisible })));
      }
    },
    [setFields, saveFieldsInSettings],
  );

  return [namespaceAwareFields, setInternalStateAndSaveUserSettings];
};
