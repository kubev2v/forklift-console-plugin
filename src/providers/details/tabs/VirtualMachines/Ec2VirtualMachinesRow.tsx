import type { FC, ReactElement } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';

import ResizableTd from '@components/common/TableView/ResizableTd';
import type { ResourceField } from '@components/common/utils/types';
import { renderResourceRowCells } from '@utils/renderResourceRowCells';
import { getEc2VM } from '@utils/types/ec2VM';

import { PowerStateCellRenderer } from './components/PowerStateCellRenderer';
import type { VMCellProps, VmData } from './components/VMCellProps';
import { VMNameCellRenderer } from './components/VMNameCellRenderer';

const Ec2InstanceTypeCellRenderer: FC<VMCellProps> = ({ data }) => {
  const vm = getEc2VM(data);
  return <>{vm?.object?.InstanceType ?? ''}</>;
};

const Ec2AvailabilityZoneCellRenderer: FC<VMCellProps> = ({ data }) => {
  const vm = getEc2VM(data);
  return <>{vm?.object?.Placement?.AvailabilityZone ?? ''}</>;
};

const cellRenderers: Record<string, FC<VMCellProps>> = {
  availabilityZone: Ec2AvailabilityZoneCellRenderer,
  instanceType: Ec2InstanceTypeCellRenderer,
  name: VMNameCellRenderer,
  status: PowerStateCellRenderer,
};

type RenderTdProps = {
  resourceData: VmData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};

const renderTd = ({
  resourceData,
  resourceFieldId,
  resourceFields,
}: RenderTdProps): ReactElement => {
  const fieldId = resourceFieldId;
  const CellRenderer = cellRenderers?.[fieldId] ?? ((): ReactElement => <></>);

  return (
    <ResizableTd
      columnId={fieldId}
      dataLabel={fieldId}
      key={fieldId}
      resourceFields={resourceFields}
    >
      <CellRenderer data={resourceData} fieldId={fieldId} fields={resourceFields} />
    </ResizableTd>
  );
};

export const Ec2VirtualMachinesCells: FC<RowProps<VmData>> = ({ resourceData, resourceFields }) =>
  renderResourceRowCells(resourceFields, resourceData, renderTd);
