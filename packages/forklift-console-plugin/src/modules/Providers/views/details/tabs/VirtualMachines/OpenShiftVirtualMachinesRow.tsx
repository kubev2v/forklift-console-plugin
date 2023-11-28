import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { ResourceField, RowProps } from '@kubev2v/common';
import { Td, Tr } from '@patternfly/react-table';

import { PowerStateCellRenderer } from './components/PowerStateCellRenderer';
import { VmResourceLinkRenderer } from './components/VmResourceLinkRenderer';
import { VMCellProps, VmData } from './components';
import { getVmTemplate } from './utils';

const cellRenderers: Record<string, React.FC<VMCellProps>> = {
  name: VmResourceLinkRenderer,
  status: PowerStateCellRenderer,
  template: ({ data }) => <TableCell>{getVmTemplate(data?.vm)}</TableCell>,
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

interface RenderTdProps {
  resourceData: VmData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
}

export const OpenShiftVirtualMachinesRow: React.FC<RowProps<VmData>> = ({
  resourceFields,
  resourceData,
}) => {
  return (
    <Tr>
      {resourceFields?.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields }),
      )}
    </Tr>
  );
};
