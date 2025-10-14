import type { FC, ReactNode } from 'react';
import { TableIconCell } from 'src/modules/Providers/utils/components/TableCell/TableIconCell';
import { useStatusPhaseValues } from 'src/modules/utils/useStatusPhaseValues';

import { getResourceFieldValue } from '@components/common/FilterGroup/matchers';
import type { ResourceField } from '@components/common/utils/types';
import { CATEGORY_TYPES } from '@utils/constants';

export const createStatusCell = <
  T extends Record<string, object | string | ((resourceData: unknown) => unknown)>,
>(
  ErrorCell: FC<{
    data: T;
    fieldId: string;
    fields: ResourceField[];
    phaseLabel: string;
    children: ReactNode;
  }>,
): React.FC<{ data: T; fieldId: string; fields: ResourceField[] }> => {
  return ({ data, fieldId, fields }) => {
    const phase = getResourceFieldValue(data, 'phase', fields);
    const { phaseIcon, phaseLabel } = useStatusPhaseValues(phase as string);

    const tableCellIcon = <TableIconCell icon={phaseIcon}>{phaseLabel}</TableIconCell>;

    if (
      phase === CATEGORY_TYPES.CRITICAL ||
      phase === CATEGORY_TYPES.FAILED ||
      phase === CATEGORY_TYPES.VALIDATION_FAILED ||
      phase === CATEGORY_TYPES.CONNECTION_FAILED
    ) {
      return (
        <ErrorCell data={data} fieldId={fieldId} fields={fields} phaseLabel={phaseLabel}>
          {tableCellIcon}
        </ErrorCell>
      );
    }

    return tableCellIcon;
  };
};
