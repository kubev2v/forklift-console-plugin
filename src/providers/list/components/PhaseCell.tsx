import type { FC } from 'react';
import { useStatusPhaseValues } from 'src/components/table/utils/useStatusPhaseValues';
import { TableIconCell } from 'src/components/TableCell/TableIconCell';
import { useForkliftTranslation } from 'src/utils/i18n';

import { getResourceFieldValue } from '@components/common/FilterGroup/matchers';
import { STATUS_ICONS } from '@components/status/statusIcons';
import { CATEGORY_TYPES } from '@utils/constants';

import type { CellProps } from './CellProps';
import { ErrorStatusCell } from './ErrorStatusCell';

export const PhaseCell: FC<CellProps> = ({ data, fieldId, fields }) => {
  const { t } = useForkliftTranslation();
  const phase = getResourceFieldValue(data, 'phase', fields);
  const { phaseIcon, phaseLabel } = useStatusPhaseValues(phase as string);
  const validationFailed = data.provider?.status?.conditions?.some(
    (condition) =>
      condition?.type === 'VirtualizationValidationFailed' && condition.status === 'True',
  );

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

  if (validationFailed) {
    return (
      <TableIconCell icon={STATUS_ICONS.warning}>
        {t('{{phase}} — validation failed', { phase: phaseLabel })}
      </TableIconCell>
    );
  }

  return tableCellIcon;
};
