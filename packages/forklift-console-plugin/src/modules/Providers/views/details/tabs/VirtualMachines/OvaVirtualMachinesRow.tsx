import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { RowProps } from 'src/components/common/TableView/types';
import { ResourceField } from '@forklift/common/utils/types';
import { OvaVM } from '@kubev2v/types';
import { Td } from '@patternfly/react-table';

import { VMCellProps, VMConcernsCellRenderer, VmData, VMNameCellRenderer } from './components';

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
  ovaPath: ({ data }) => <TableCell>{(data?.vm as OvaVM)?.OvaPath}</TableCell>,
};

export const OvaVirtualMachinesCells: React.FC<RowProps<VmData>> = ({
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
