import { useMemo, useState } from 'react';
import { NAMESPACE } from 'src/utils/constants';

import { Field } from '../types';

/**
 * Keeps the list of fields. Toggles the visibility of the namespace field based on currently used namspace.
 *
 * @param currentNamespace
 * @param defaultFields used for initialization
 * @returns [fields, setFields]
 */
export const useFields = (
  currentNamespace: string,
  defaultFields: Field[],
): [Field[], React.Dispatch<React.SetStateAction<Field[]>>] => {
  const [fields, setFields] = useState<Field[]>(defaultFields.map((it) => ({ ...it })));
  const namespaceAwareFields: Field[] = useMemo(
    () =>
      fields.map(({ id, isVisible = false, ...rest }) => ({
        id,
        ...rest,
        isVisible: id === NAMESPACE ? !currentNamespace : isVisible,
      })),
    [currentNamespace, fields],
  );
  return [namespaceAwareFields, setFields];
};
