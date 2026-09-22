import type { FC, ReactElement } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';
import type { VirtualizationValidationCheckResult } from 'src/virtualizationValidation/types';

import { Icon, Label } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

type ValidationCheckResultsTableProps = {
  checks: VirtualizationValidationCheckResult[];
};

type CheckStatusConfig = {
  color?: 'green' | 'grey' | 'red';
  icon: ReactElement;
};

const getCheckStatusConfig = (status: string): CheckStatusConfig => {
  switch (status) {
    case 'passed':
      return { color: 'green', icon: <CheckCircleIcon /> };
    case 'failed':
      return { color: 'red', icon: <ExclamationCircleIcon /> };
    case 'pending':
      return { color: 'grey', icon: <InProgressIcon /> };
    default:
      return { icon: <MinusCircleIcon /> };
  }
};

const formatDuration = (duration: number | undefined): string => {
  if (duration === undefined) {
    return '—';
  }

  const decimalPlaces = duration < 1000 ? 1 : 0;

  return `${(duration / 1000).toFixed(decimalPlaces)} s`;
};

const ValidationCheckResultsTable: FC<ValidationCheckResultsTableProps> = ({ checks }) => {
  const { t } = useForkliftTranslation();

  return (
    <Table aria-label={t('Validation check results')} variant="compact">
      <Thead>
        <Tr>
          <Th>{t('Check')}</Th>
          <Th>{t('Status')}</Th>
          <Th>{t('Duration')}</Th>
          <Th>{t('Message')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {checks.map((check) => {
          const status = getCheckStatusConfig(check.status);

          return (
            <Tr key={check.id}>
              <Td>{check.id}</Td>
              <Td>
                <Label color={status.color} icon={<Icon isInline>{status.icon}</Icon>}>
                  {check.status}
                </Label>
              </Td>
              <Td>{formatDuration(check.duration)}</Td>
              <Td>{check.message ?? '—'}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default ValidationCheckResultsTable;
