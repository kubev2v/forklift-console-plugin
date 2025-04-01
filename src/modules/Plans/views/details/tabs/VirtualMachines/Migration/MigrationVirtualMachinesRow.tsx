import React from 'react';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import type { RowProps } from 'src/components/common/TableView/types';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp/ConsoleTimestamp';

import type { ResourceField } from '@components/common/utils/types';
import type { V1beta1PlanStatusMigrationVmsPipeline } from '@kubev2v/types';
import { FlexItem, Popover, ProgressStep, ProgressStepper } from '@patternfly/react-core';
import { ResourcesAlmostFullIcon, ResourcesFullIcon } from '@patternfly/react-icons';
import { Table, Td, Tr } from '@patternfly/react-table';

import { hasTaskCompleted } from '../../../utils/hasTaskCompleted';
import { NameCellRenderer } from '../components/NameCellRenderer';
import type { PlanVMsCellProps } from '../components/PlanVMsCellProps';
import type { VMData } from '../types/VMData';

export const MigrationVirtualMachinesRow: React.FC<RowProps<VMData>> = ({
  resourceData,
  resourceFields,
}) => {
  return (
    <>
      {resourceFields?.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields }),
      )}
    </>
  );
};

const renderTd = ({ resourceData, resourceFieldId, resourceFields }: RenderTdProps) => {
  const fieldId = resourceFieldId;

  const CellRenderer = cellRenderers?.[fieldId] ?? (() => <></>);
  return (
    <Td key={fieldId} dataLabel={fieldId}>
      <CellRenderer data={resourceData} fieldId={fieldId} fields={resourceFields} />
    </Td>
  );
};

const cellRenderers: Record<string, React.FC<PlanVMsCellProps>> = {
  diskCounter: (props: PlanVMsCellProps) => {
    const diskTransfer = props.data.statusVM?.pipeline.find((p) =>
      p?.name?.startsWith('DiskTransfer'),
    );

    const { completedTasks, totalTasks } = countTasks(diskTransfer);

    return totalTasks ? (
      <>
        {completedTasks || '-'} / {totalTasks || '-'} Disks
      </>
    ) : (
      <>-</>
    );
  },
  migrationCompleted: (props: PlanVMsCellProps) => {
    const value = getResourceFieldValue(props.data, props.fieldId, props.fields);
    return <ConsoleTimestamp timestamp={value} />;
  },
  migrationStarted: (props: PlanVMsCellProps) => {
    const value = getResourceFieldValue(props.data, props.fieldId, props.fields);
    return <ConsoleTimestamp timestamp={value} />;
  },
  name: NameCellRenderer,
  status: (props: PlanVMsCellProps) => {
    const pipeline = props.data.statusVM?.pipeline || [];
    let lastRunningItem: V1beta1PlanStatusMigrationVmsPipeline;

    if (pipeline[0]?.phase === 'Pending') {
      lastRunningItem = pipeline[0];
    } else if (pipeline[pipeline.length - 1]?.phase === 'Completed') {
      lastRunningItem = pipeline[pipeline.length - 1];
    } else {
      const lastNonePendingIndex = pipeline.findIndex((p) => p?.phase === 'Pending') - 1;
      lastRunningItem = pipeline[lastNonePendingIndex];
    }

    const alertSeverityVariant = gePopoverVariant(lastRunningItem);

    return (
      <Popover
        showClose={false}
        alertSeverityVariant={alertSeverityVariant}
        headerIcon={getIcon(lastRunningItem)}
        headerContent={lastRunningItem?.name}
        bodyContent={
          <Table variant="compact">
            <Tr>
              <Td colSpan={2}>{lastRunningItem?.description}</Td>
            </Tr>
            <Tr>
              <Td>Started:</Td>
              <Td>
                <ConsoleTimestamp timestamp={lastRunningItem?.started} />
              </Td>
            </Tr>
            <Tr>
              <Td>Completed:</Td>
              <Td>
                {lastRunningItem?.completed ? (
                  <ConsoleTimestamp timestamp={lastRunningItem?.completed} />
                ) : (
                  '-'
                )}
              </Td>
            </Tr>
            {lastRunningItem?.error && (
              <Tr>
                <Td>Error:</Td>
                <Td>
                  <FlexItem>{lastRunningItem?.error?.reasons}</FlexItem>
                </Td>
              </Tr>
            )}
          </Table>
        }
      >
        <ProgressStepper
          isCompact
          isVertical={false}
          isCenterAligned={true}
          className="forklift-page-plan-details-vm-status"
        >
          {pipeline.map((p) => (
            <ProgressStep
              key={p?.name}
              variant={getVariant(p)}
              icon={getIcon(p)}
              id={p?.name}
              titleId={p?.name}
            >
              {p?.name}
            </ProgressStep>
          ))}
        </ProgressStepper>
      </Popover>
    );
  },
  transfer: (props: PlanVMsCellProps) => {
    const diskTransfer = props.data.statusVM?.pipeline.find((p) =>
      p?.name?.startsWith('DiskTransfer'),
    );
    const annotations: { unit: string } = diskTransfer?.annotations as undefined;
    const { completed, total } = getTransferProgress(diskTransfer);

    return annotations?.unit ? (
      <>
        {completed} / {total} {annotations?.unit || '-'}
      </>
    ) : (
      <>-</>
    );
  },
};

type RenderTdProps = {
  resourceData: VMData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};

type ProgressStepperVariant = 'default' | 'success' | 'info' | 'pending' | 'warning' | 'danger';
type PopoverVariant = 'success' | 'info' | 'warning' | 'danger' | 'custom';

type GetVariantType = (p: V1beta1PlanStatusMigrationVmsPipeline) => ProgressStepperVariant;
type GetPopoverVariantType = (p: V1beta1PlanStatusMigrationVmsPipeline) => PopoverVariant;

type GetIconType = (p: V1beta1PlanStatusMigrationVmsPipeline) => React.ReactNode;

export const getVariant: GetVariantType = (p) => {
  if (p?.error) {
    return 'danger';
  }

  switch (p?.phase) {
    case 'Completed':
      return 'success';
    case 'Pending':
      return 'pending';
    case 'Running':
      return 'info';
    default:
      return 'pending';
  }
};

const gePopoverVariant: GetPopoverVariantType = (p) => {
  if (p?.error) {
    return 'danger';
  }

  switch (p?.phase) {
    case 'Completed':
      return 'success';
    case 'Pending':
    case 'Running':
      return 'info';
    default:
      return 'custom';
  }
};

export const getIcon: GetIconType = (p) => {
  if (p?.error) {
    return <ResourcesAlmostFullIcon />;
  }

  switch (p?.phase) {
    case 'Completed':
      return <ResourcesFullIcon />;
    case 'Pending':
      return undefined;
    case 'Running':
      return <ResourcesAlmostFullIcon />;
    default:
      return undefined;
  }
};

const countTasks = (diskTransfer: V1beta1PlanStatusMigrationVmsPipeline) => {
  if (!diskTransfer || !Array.isArray(diskTransfer?.tasks)) {
    return { completedTasks: 0, totalTasks: 0 };
  }

  const totalTasks = diskTransfer.tasks.length;

  // search num of completed tasks (either tasks that completed successfully or ones that aren't finished but their pipeline step is).
  const completedTasks = diskTransfer.tasks.filter((task) =>
    hasTaskCompleted(task.phase, task.progress, diskTransfer),
  ).length;

  return { completedTasks, totalTasks };
};

const getTransferProgress = (diskTransfer) => {
  if (!diskTransfer?.progress) {
    return { completed: '-', total: '-' };
  }

  const { completed, total } = diskTransfer.progress;
  return {
    completed: completed !== undefined ? completed : '-',
    total: total !== undefined ? total : '-',
  };
};
