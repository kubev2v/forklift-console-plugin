import type { FC, ReactElement } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';
import type { VirtualizationValidationExecution } from 'src/virtualizationValidation/types';

import { Icon, Label } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

type ValidationCheckResultsTableProps = {
  executions: VirtualizationValidationExecution[];
};

type CheckStatusConfig = {
  color?: 'green' | 'grey' | 'red';
  icon: ReactElement;
};

const getCheckStatusConfig = (outcome: string): CheckStatusConfig => {
  switch (outcome) {
    case 'Passed':
      return { color: 'green', icon: <CheckCircleIcon /> };
    case 'Error':
    case 'Failed':
    case 'TimedOut':
      return { color: 'red', icon: <ExclamationCircleIcon /> };
    case 'Pending':
    case 'Running':
      return { color: 'grey', icon: <InProgressIcon /> };
    default:
      return { icon: <MinusCircleIcon /> };
  }
};

const formatDuration = (durationMilliseconds: number | undefined): string => {
  if (durationMilliseconds === undefined) {
    return '—';
  }

  const decimalPlaces = durationMilliseconds < 1000 ? 1 : 0;

  return `${(durationMilliseconds / 1000).toFixed(decimalPlaces)} s`;
};

const executionKey = (execution: VirtualizationValidationExecution): string => {
  const { subject } = execution;

  return [
    execution.checkId,
    execution.executionId ?? execution.name,
    subject?.kind,
    subject?.namespace,
    subject?.name,
  ].join('-');
};

const ValidationCheckResultsTable: FC<ValidationCheckResultsTableProps> = ({ executions }) => {
  const { t } = useForkliftTranslation();

  return (
    <Table aria-label={t('Validation check results')} variant="compact">
      <Thead>
        <Tr>
          <Th>{t('Validation check')}</Th>
          <Th>{t('Outcome')}</Th>
          <Th>{t('Severity')}</Th>
          <Th>{t('Scope')}</Th>
          <Th>{t('Duration')}</Th>
          <Th>{t('Details')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {executions.map((execution) => {
          const status = getCheckStatusConfig(execution.outcome);
          const scope = execution.subject?.name ?? execution.parameters?.requestedNodeName;

          return (
            <Tr key={executionKey(execution)}>
              <Td>{execution.name}</Td>
              <Td>
                <Label color={status.color} icon={<Icon isInline>{status.icon}</Icon>}>
                  {t(execution.outcome)}
                </Label>
              </Td>
              <Td>{execution.severity}</Td>
              <Td>{scope ?? '—'}</Td>
              <Td>{formatDuration(execution.durationMilliseconds)}</Td>
              <Td>{execution.message ?? execution.reason ?? '—'}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default ValidationCheckResultsTable;
