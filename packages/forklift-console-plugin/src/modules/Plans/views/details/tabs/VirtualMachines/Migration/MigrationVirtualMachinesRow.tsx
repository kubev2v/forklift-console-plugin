import React from 'react';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp';

import { getResourceFieldValue, ResourceField, RowProps } from '@kubev2v/common';
import { Td } from '@kubev2v/common';
import { V1beta1PlanStatusMigrationVmsPipeline } from '@kubev2v/types';
import { FlexItem, Popover, ProgressStep, ProgressStepper } from '@patternfly/react-core';
import { ResourcesAlmostFullIcon, ResourcesFullIcon } from '@patternfly/react-icons';
import { Table, Tr } from '@patternfly/react-table';

import { hasTaskCompleted } from '../../../utils';
import { PlanVMsCellProps } from '../components';
import { NameCellRenderer } from '../components/NameCellRenderer';
import { VMData } from '../types';

export const MigrationVirtualMachinesRow: React.FC<RowProps<VMData>> = ({
  resourceFields,
  resourceData,
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
  name: NameCellRenderer,
  migrationStarted: (props: PlanVMsCellProps) => {
    const value = getResourceFieldValue(props.data, props.fieldId, props.fields);
    return <ConsoleTimestamp timestamp={value} />;
  },
  migrationCompleted: (props: PlanVMsCellProps) => {
    const value = getResourceFieldValue(props.data, props.fieldId, props.fields);
    return <ConsoleTimestamp timestamp={value} />;
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
  diskCounter: (props: PlanVMsCellProps) => {
    const diskTransfer = props.data.statusVM?.pipeline.find((p) =>
      p?.name?.startsWith('DiskTransfer'),
    );

    const { totalTasks, completedTasks } = countTasks(diskTransfer);

    return totalTasks ? (
      <>
        {completedTasks || '-'} / {totalTasks || '-'} Disks
      </>
    ) : (
      <>-</>
    );
  },
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
            <Tr onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
              <Td colSpan={2}>{lastRunningItem?.description}</Td>
            </Tr>
            <Tr onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
              <Td>Started:</Td>
              <Td>
                <ConsoleTimestamp timestamp={lastRunningItem?.started} />
              </Td>
            </Tr>
            <Tr onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
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
              <Tr onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
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
};

interface RenderTdProps {
  resourceData: VMData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
}

type ProgressStepperVariant = 'default' | 'success' | 'info' | 'pending' | 'warning' | 'danger';
type PopoverVariant = 'default' | 'success' | 'info' | 'warning' | 'danger';

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
      return 'default';
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
    return { totalTasks: 0, completedTasks: 0 };
  }

  const totalTasks = diskTransfer.tasks.length;

  // search num of completed tasks (either tasks that completed successfully or ones that aren't finished but their pipeline step is).
  const completedTasks = diskTransfer.tasks.filter((task) =>
    hasTaskCompleted(task.phase, diskTransfer),
  ).length;

  return { totalTasks, completedTasks };
};

const getTransferProgress = (diskTransfer) => {
  if (!diskTransfer || !diskTransfer.progress) {
    return { completed: '-', total: '-' };
  }

  const { completed, total } = diskTransfer.progress;
  return {
    completed: completed !== undefined ? completed : '-',
    total: total !== undefined ? total : '-',
  };
};
