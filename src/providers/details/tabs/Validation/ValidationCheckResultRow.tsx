import { type FC, useState } from 'react';
import type { VirtualizationValidationExecution } from 'src/virtualizationValidation/types';

import { ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';

import ValidationOutcomeLabel from './ValidationOutcomeLabel';
import ValidationWorkflowStepsTable from './ValidationWorkflowStepsTable';

type ValidationCheckResultRowProps = {
  execution: VirtualizationValidationExecution;
  hasExpandableRows: boolean;
  rowIndex: number;
};

const formatDuration = (durationMilliseconds: number | undefined): string => {
  if (durationMilliseconds === undefined) {
    return '—';
  }

  const decimalPlaces = durationMilliseconds < 1000 ? 1 : 0;

  return `${(durationMilliseconds / 1000).toFixed(decimalPlaces)} s`;
};

const hasNonPassingStep = (execution: VirtualizationValidationExecution): boolean =>
  execution.steps?.some((step) => step.outcome !== 'Passed') ?? false;

const ValidationCheckResultRow: FC<ValidationCheckResultRowProps> = ({
  execution,
  hasExpandableRows,
  rowIndex,
}) => {
  const steps = execution.steps ?? [];
  const hasSteps = steps.length > 0;
  const [isExpanded, setIsExpanded] = useState(hasNonPassingStep(execution));
  const scope = execution.subject?.name ?? execution.parameters?.requestedNodeName;

  return (
    <Tbody isExpanded={hasSteps && isExpanded}>
      <Tr>
        {hasExpandableRows &&
          (hasSteps ? (
            <Td
              expand={{
                isExpanded,
                onToggle: () => {
                  setIsExpanded((expanded) => !expanded);
                },
                rowIndex,
              }}
            />
          ) : (
            <Td />
          ))}
        <Td>{execution.name}</Td>
        <Td>
          <ValidationOutcomeLabel outcome={execution.outcome} />
        </Td>
        <Td>{execution.severity}</Td>
        <Td>{scope ?? '—'}</Td>
        <Td>{formatDuration(execution.durationMilliseconds)}</Td>
        <Td>{execution.message ?? execution.reason ?? '—'}</Td>
      </Tr>
      {hasSteps && (
        <Tr isExpanded={isExpanded}>
          {hasExpandableRows && <Td />}
          <Td colSpan={6} noPadding>
            {isExpanded && (
              <ExpandableRowContent>
                <ValidationWorkflowStepsTable steps={steps} />
              </ExpandableRowContent>
            )}
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};

export default ValidationCheckResultRow;
