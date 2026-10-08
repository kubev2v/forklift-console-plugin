import type { FC, ReactElement } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/components/TableCell/TableCell';

import ResizableTd from '@components/common/TableView/ResizableTd';
import type { ResourceField } from '@components/common/utils/types';
import type { OpenstackVM } from '@forklift-ui/types';
import { renderResourceRowCells } from '@utils/renderResourceRowCells';

import type { VMCellProps, VmData } from './components/VMCellProps';
import { VMConcernsCellRenderer } from './components/VMConcernsCellRenderer';
import { VMNameCellRenderer } from './components/VMNameCellRenderer';

const cellRenderers: Record<string, FC<VMCellProps>> = {
  concerns: VMConcernsCellRenderer,
  flavorID: ({ data }) => <TableCell>{(data?.vm as OpenstackVM)?.flavorID}</TableCell>,
  hostID: ({ data }) => <TableCell>{(data?.vm as OpenstackVM)?.hostID}</TableCell>,
  imageID: ({ data }) => <TableCell>{(data?.vm as OpenstackVM)?.imageID}</TableCell>,
  name: VMNameCellRenderer,
  path: ({ data }) => <TableCell>{(data?.vm as OpenstackVM)?.path}</TableCell>,
  status: ({ data }) => <TableCell>{(data?.vm as OpenstackVM)?.status}</TableCell>,
  tenantID: ({ data }) => <TableCell>{(data?.vm as OpenstackVM)?.tenantID}</TableCell>,
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

export const OpenStackVirtualMachinesCells: FC<RowProps<VmData>> = ({
  resourceData,
  resourceFields,
}) => renderResourceRowCells(resourceFields, resourceData, renderTd);
