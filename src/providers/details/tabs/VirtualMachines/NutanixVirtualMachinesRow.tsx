import type { FC, ReactElement } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/components/TableCell/TableCell';

import ResizableTd from '@components/common/TableView/ResizableTd';
import type { ResourceField } from '@components/common/utils/types';
import type { NutanixVM } from '@forklift-ui/types';
import { renderResourceRowCells } from '@utils/renderResourceRowCells';

import { GuestOSCellRenderer } from './components/GuestOSCellRenderer';
import { PowerStateCellRenderer } from './components/PowerStateCellRenderer';
import type { VMCellProps, VmData } from './components/VMCellProps';
import { VMConcernsCellRenderer } from './components/VMConcernsCellRenderer';
import { VMNameCellRenderer } from './components/VMNameCellRenderer';

const cellRenderers: Record<string, FC<VMCellProps>> = {
  cluster: ({ data }) => <TableCell>{(data?.vm as NutanixVM)?.cluster}</TableCell>,
  concerns: VMConcernsCellRenderer,
  guestOS: GuestOSCellRenderer,
  host: ({ data }) => <TableCell>{(data?.vm as NutanixVM)?.host}</TableCell>,
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

export const NutanixVirtualMachinesCells: FC<RowProps<VmData>> = ({
  resourceData,
  resourceFields,
}) => renderResourceRowCells(resourceFields, resourceData, renderTd);
