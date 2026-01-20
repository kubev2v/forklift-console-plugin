import { criticalConcernTableField } from 'src/plans/create/steps/virtual-machines/constants';

import type { ResourceField } from '@components/common/utils/types';

import { CustomFilterType } from '../../constants';

/**
 * Arranges fields array with critical concern at the beginning when enabled
 */
export const getVmTableResourceFields = (
  fields: ResourceField[],
  hasCriticalFilter?: boolean,
): ResourceField[] => {
  const updatedFields = fields.map((resourceField) => {
    if (resourceField.filter?.type === CustomFilterType.Concerns && hasCriticalFilter) {
      return {
        ...resourceField,
        filter: {
          ...resourceField.filter,
          isHidden: true,
        },
      };
    }

    return resourceField;
  });

  return [...(hasCriticalFilter ? [criticalConcernTableField] : []), ...updatedFields];
};
