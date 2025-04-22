import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import type { ResourceField } from '@components/common/utils/types';
import type { OpenstackVM } from '@kubev2v/types';
import { Td } from '@patternfly/react-table';

import type { VMCellProps, VmData } from './components/VMCellProps';
import { VMConcernsCellRenderer } from './components/VMConcernsCellRenderer';
import { VMNameCellRenderer } from './components/VMNameCellRenderer';

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

export const OpenStackVirtualMachinesCells: FC<RowProps<VmData>> = ({
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
