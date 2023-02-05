import * as React from 'react';
import { Button, Flex, FlexItem, Popover, Text } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  ICell,
  IRow,
  cellWidth,
  truncate,
} from '@patternfly/react-table';

import { Step } from './Step';
import { IVMStatus, IStep } from 'legacy/src/queries/types';
import { TickingElapsedTime } from 'legacy/src/common/components/TickingElapsedTime';
import { findCurrentStep, getStepType, isStepOnError } from 'legacy/src/common/helpers';

interface IVMStatusPipelineTableProps {
  status: IVMStatus;
  isCanceled: boolean;
}

const renderStepPhase = (step: IStep) => {
  if (step.phase) {
    if (step.reason) return `${step.phase} - ${step.reason}`;
    return step.phase;
  }
  return null;
};

export const VMStatusPipelineTable: React.FunctionComponent<IVMStatusPipelineTableProps> = ({
  status,
  isCanceled,
}: IVMStatusPipelineTableProps) => {
  const columns: ICell[] = [
    {
      title: 'Step',
      transforms: [cellWidth(40)],
    },
    { title: 'Elapsed time', transforms: [cellWidth(20)] },
    { title: 'State', cellTransforms: [truncate] },
  ];

  const { currentStepIndex } = findCurrentStep(status.pipeline);

  const rows: IRow[] = status.pipeline.map((step: IStep, index) => {
    const isCurrentStep = currentStepIndex === index;
    const error = step.error || (isCurrentStep && status.error);
    return {
      meta: { step },
      cells: [
        {
          title: (
            <Flex
              spaceItems={{ default: 'spaceItemsSm' }}
              alignContent={{ default: 'alignContentFlexStart' }}
              flexWrap={{ default: 'nowrap' }}
            >
              <FlexItem>
                <Step
                  vmStatus={status}
                  type={getStepType(status, index, isCanceled)}
                  error={isStepOnError(status, index)}
                />
              </FlexItem>
              <FlexItem>
                <Text>{step.description ? step.description.replace(/\.$/, '') : ''}</Text>
              </FlexItem>
            </Flex>
          ),
        },
        {
          title: (
            <TickingElapsedTime start={step.started} end={step.completed || status.completed} />
          ),
        },
        {
          title: error ? (
            <Popover headerContent={error.phase} bodyContent={error?.reasons}>
              <Button variant="link" isInline>
                {renderStepPhase(step) || error?.reasons}
              </Button>
            </Popover>
          ) : (
            renderStepPhase(step)
          ),
        },
      ],
    };
  });

  return (
    <>
      <Table
        className="migration-inner-vmStatus-table"
        variant="compact"
        aria-label="VM status table for migration plan"
        cells={columns}
        rows={rows}
      >
        <TableHeader />
        <TableBody />
      </Table>
    </>
  );
};
