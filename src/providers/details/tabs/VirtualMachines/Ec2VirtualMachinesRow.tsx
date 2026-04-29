import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';

import type { ResourceField } from '@components/common/utils/types';
import { Td } from '@patternfly/react-table';
import { renderResourceRowCells } from '@utils/renderResourceRowCells';

import { PowerStateCellRenderer } from './components/PowerStateCellRenderer';
import type { VMCellProps, VmData } from './components/VMCellProps';
import { VMNameCellRenderer } from './components/VMNameCellRenderer';
import { getEc2VM } from './utils/types/Ec2VM';

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

const renderTd = ({ resourceData, resourceFieldId, resourceFields }: RenderTdProps) => {
  const fieldId = resourceFieldId;
  const CellRenderer = cellRenderers?.[fieldId] ?? (() => <></>);

  return (
    <Td key={fieldId} dataLabel={fieldId}>
      <CellRenderer data={resourceData} fieldId={fieldId} fields={resourceFields} />
    </Td>
  );
};

export const Ec2VirtualMachinesCells: FC<RowProps<VmData>> = ({ resourceData, resourceFields }) =>
  renderResourceRowCells(resourceFields, resourceData, renderTd);
