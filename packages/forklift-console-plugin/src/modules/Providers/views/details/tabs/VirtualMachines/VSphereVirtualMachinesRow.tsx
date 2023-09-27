import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { ResourceField, RowProps } from '@kubev2v/common';
import { VSphereVM } from '@kubev2v/types';
import { Td, Tr } from '@patternfly/react-table';

import {
  PowerStateCellRenderer,
  VMCellProps,
  VMConcernsCellRenderer,
  VMNameCellRenderer,
} from './components';

export interface VmData {
  vm: VSphereVM;
  name: string;
  concerns: string;
}

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
  host: ({ data }) => <TableCell>{(data?.vm as VSphereVM)?.host}</TableCell>,
  isTemplate: ({ data }) => (
    <TableCell>{Boolean((data?.vm as VSphereVM)?.isTemplate).toString()}</TableCell>
  ),
  path: ({ data }) => <TableCell>{(data?.vm as VSphereVM)?.path}</TableCell>,
  powerState: PowerStateCellRenderer,
};

export const VSphereVirtualMachinesRow: React.FC<RowProps<VmData>> = ({
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
