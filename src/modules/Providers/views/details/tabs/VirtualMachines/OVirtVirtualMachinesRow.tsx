import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import type { ResourceField } from '@components/common/utils/types';
import type { OVirtVM } from '@kubev2v/types';
import { Td } from '@patternfly/react-table';
import { renderResourceRowCells } from '@utils/renderResourceRowCells';

import { PowerStateCellRenderer } from './components/PowerStateCellRenderer';
import type { VMCellProps, VmData } from './components/VMCellProps';
import { VMConcernsCellRenderer } from './components/VMConcernsCellRenderer';
import { VMNameCellRenderer } from './components/VMNameCellRenderer';

const cellRenderers: Record<string, FC<VMCellProps>> = {
  cluster: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.cluster}</TableCell>,
  concerns: VMConcernsCellRenderer,
  description: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.description}</TableCell>,
  host: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.host}</TableCell>,
  name: VMNameCellRenderer,
  path: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.path}</TableCell>,
  status: PowerStateCellRenderer,
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

type RenderTdProps = {
  resourceData: VmData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};

export const OVirtVirtualMachinesCells: FC<RowProps<VmData>> = ({ resourceData, resourceFields }) =>
  renderResourceRowCells(resourceFields, resourceData, renderTd);
