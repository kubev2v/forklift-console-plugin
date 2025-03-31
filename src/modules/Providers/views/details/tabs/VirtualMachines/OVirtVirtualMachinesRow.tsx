import React from 'react';
import { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import { ResourceField } from '@components/common/utils/types';
import { OVirtVM } from '@kubev2v/types';
import { Td } from '@patternfly/react-table';

import { PowerStateCellRenderer } from './components/PowerStateCellRenderer';
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
  host: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.host}</TableCell>,
  cluster: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.cluster}</TableCell>,
  path: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.path}</TableCell>,
  status: PowerStateCellRenderer,
  description: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.description}</TableCell>,
};

export const OVirtVirtualMachinesCells: React.FC<RowProps<VmData>> = ({
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
