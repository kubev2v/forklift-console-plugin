import type { FC, ReactElement } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';

import ResizableTd from '@components/common/TableView/ResizableTd';
import type { ResourceField } from '@components/common/utils/types';
import { renderResourceRowCells } from '@utils/renderResourceRowCells';
import { getAzureVM } from '@utils/types/azureVM';

import { PowerStateCellRenderer } from './components/PowerStateCellRenderer';
import type { VMCellProps, VmData } from './components/VMCellProps';
import { VMNameCellRenderer } from './components/VMNameCellRenderer';

const AzureVmSizeCellRenderer: FC<VMCellProps> = ({ data }) => {
  const vm = getAzureVM(data);
  return <>{vm?.object?.properties?.hardwareProfile?.vmSize ?? ''}</>;
};

const AzureOsTypeCellRenderer: FC<VMCellProps> = ({ data }) => {
  const vm = getAzureVM(data);
  return <>{vm?.object?.properties?.storageProfile?.osDisk?.osType ?? ''}</>;
};

const AzureCpuCountCellRenderer: FC<VMCellProps> = ({ data }) => {
  const vm = getAzureVM(data);
  return <>{vm?.cpuCount ?? ''}</>;
};

const AzureMemoryCellRenderer: FC<VMCellProps> = ({ data }) => {
  const vm = getAzureVM(data);
  return <>{vm?.memoryMB ? Math.round(vm.memoryMB / 1024) : ''}</>;
};

const cellRenderers: Record<string, FC<VMCellProps>> = {
  cpuCount: AzureCpuCountCellRenderer,
  memoryGB: AzureMemoryCellRenderer,
  name: VMNameCellRenderer,
  osType: AzureOsTypeCellRenderer,
  status: PowerStateCellRenderer,
  vmSize: AzureVmSizeCellRenderer,
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

export const AzureVirtualMachinesCells: FC<RowProps<VmData>> = ({ resourceData, resourceFields }) =>
  renderResourceRowCells(resourceFields, resourceData, renderTd);
