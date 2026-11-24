import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';
import type { VirtualizationValidationExecution } from 'src/virtualizationValidation/types';

import { Table, Th, Thead, Tr } from '@patternfly/react-table';

import ValidationCheckResultRow from './ValidationCheckResultRow';

type ValidationCheckResultsTableProps = {
  executions: VirtualizationValidationExecution[];
};

const hasWorkflowSteps = (execution: VirtualizationValidationExecution): boolean =>
  execution.steps !== undefined && execution.steps.length > 0;

const ValidationCheckResultsTable: FC<ValidationCheckResultsTableProps> = ({ executions }) => {
  const { t } = useForkliftTranslation();
  const hasExpandableRows = executions.some(hasWorkflowSteps);

  return (
    <Table aria-label={t('Validation check results')} variant="compact">
      <Thead>
        <Tr>
          {hasExpandableRows && <Th />}
          <Th>{t('Validation check')}</Th>
          <Th>{t('Outcome')}</Th>
          <Th>{t('Severity')}</Th>
          <Th>{t('Scope')}</Th>
          <Th>{t('Duration')}</Th>
          <Th>{t('Details')}</Th>
        </Tr>
      </Thead>
      {executions.map((execution, index) => (
        <ValidationCheckResultRow
          execution={execution}
          hasExpandableRows={hasExpandableRows}
          key={[
            execution.checkId,
            execution.executionId ?? execution.name,
            execution.subject?.kind,
            execution.subject?.namespace,
            execution.subject?.name,
          ].join('-')}
          rowIndex={index}
        />
      ))}
    </Table>
  );
};

export default ValidationCheckResultsTable;
