import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';
import type { VirtualizationValidationStep } from 'src/virtualizationValidation/types';

import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import ValidationOutcomeLabel from './ValidationOutcomeLabel';

type ValidationWorkflowStepsTableProps = {
  steps: VirtualizationValidationStep[];
};

const getStepDetails = (step: VirtualizationValidationStep): string => {
  const extra = Object.entries(step.extra ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');

  return [step.reason, extra]
    .filter((detail): detail is string => detail !== undefined && detail !== '')
    .join(' · ');
};

const ValidationWorkflowStepsTable: FC<ValidationWorkflowStepsTableProps> = ({ steps }) => {
  const { t } = useForkliftTranslation();

  return (
    <Table aria-label={t('Workflow steps')} variant="compact">
      <Thead>
        <Tr>
          <Th>{t('Step')}</Th>
          <Th>{t('Outcome')}</Th>
          <Th>{t('Details')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {steps.map((step, index) => (
          <Tr key={`${step.name}-${index}`}>
            <Td>{step.name}</Td>
            <Td>
              <ValidationOutcomeLabel outcome={step.outcome} />
            </Td>
            <Td>{getStepDetails(step) || '—'}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ValidationWorkflowStepsTable;
