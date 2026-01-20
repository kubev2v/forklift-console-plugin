import type { FC } from 'react';
import { useStatusPhaseValues } from 'src/components/table/utils/useStatusPhaseValues';
import { TableIconCell } from 'src/components/TableCell/TableIconCell';

import { getResourceFieldValue } from '@components/common/FilterGroup/matchers';
import { CATEGORY_TYPES } from '@utils/constants';

import type { CellProps } from './CellProps';
import { ErrorStatusCell } from './ErrorStatusCell';

export const PhaseCell: FC<CellProps> = ({ data, fieldId, fields }) => {
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
      <ErrorStatusCell data={data} fieldId={fieldId} fields={fields} phaseLabel={phaseLabel}>
        {tableCellIcon}
      </ErrorStatusCell>
    );
  }

  return tableCellIcon;
};
