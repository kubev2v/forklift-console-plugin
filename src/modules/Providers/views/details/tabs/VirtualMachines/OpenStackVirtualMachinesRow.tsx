import React from 'react';
import { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import { ResourceField } from '@components/common/utils/types';
import { OpenstackVM } from '@kubev2v/types';
import { Td } from '@patternfly/react-table';

import { VMCellProps, VmData } from './components/VMCellProps';
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

interface RenderTdProps {
  resourceData: VmData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
}

const cellRenderers: Record<string, React.FC<VMCellProps>> = {
  name: VMNameCellRenderer,
  concerns: VMConcernsCellRenderer,
  hostID: ({ data }) => <TableCell>{(data?.vm as OpenstackVM)?.hostID}</TableCell>,
  path: ({ data }) => <TableCell>{(data?.vm as OpenstackVM)?.path}</TableCell>,
  status: ({ data }) => <TableCell>{(data?.vm as OpenstackVM)?.status}</TableCell>,
  tenantID: ({ data }) => <TableCell>{(data?.vm as OpenstackVM)?.tenantID}</TableCell>,
  imageID: ({ data }) => <TableCell>{(data?.vm as OpenstackVM)?.imageID}</TableCell>,
  flavorID: ({ data }) => <TableCell>{(data?.vm as OpenstackVM)?.flavorID}</TableCell>,
};

export const OpenStackVirtualMachinesCells: React.FC<RowProps<VmData>> = ({
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
