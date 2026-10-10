import type { FC, ReactElement } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/components/TableCell/TableCell';

import ResizableTd from '@components/common/TableView/ResizableTd';
import type { ResourceField } from '@components/common/utils/types';
import { renderResourceRowCells } from '@utils/renderResourceRowCells';

import { GuestOSCellRenderer } from './components/GuestOSCellRenderer';
import { PowerStateCellRenderer } from './components/PowerStateCellRenderer';
import type { VMCellProps, VmData } from './components/VMCellProps';
import { VMConcernsCellRenderer } from './components/VMConcernsCellRenderer';
import { VMNameCellRenderer } from './components/VMNameCellRenderer';

const cellRenderers: Record<string, FC<VMCellProps>> = {
  concerns: VMConcernsCellRenderer,
  guestOS: GuestOSCellRenderer,
  // Cast pending upstream types adding `host` to HypervVM
  host: ({ data }) => <TableCell>{(data?.vm as unknown as { host?: string })?.host}</TableCell>,
  name: VMNameCellRenderer,
  status: PowerStateCellRenderer,
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

type RenderTdProps = {
  resourceData: VmData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};

export const HypervVirtualMachinesCells: FC<RowProps<VmData>> = ({
  resourceData,
  resourceFields,
}) => renderResourceRowCells(resourceFields, resourceData, renderTd);
