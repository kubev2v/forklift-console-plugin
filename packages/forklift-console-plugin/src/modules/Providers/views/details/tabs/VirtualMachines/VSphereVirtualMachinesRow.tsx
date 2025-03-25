import React from 'react';
import { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils';

import { ResourceField } from '@components/common/utils/types';
import { VSphereVM } from '@kubev2v/types';
import { Td } from '@patternfly/react-table';

import {
  PowerStateCellRenderer,
  VMCellProps,
  VMConcernsCellRenderer,
  VmData,
  VMNameCellRenderer,
} from './components';

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
  host: ({ data }) => <TableCell>{data?.hostName}</TableCell>,
  folder: ({ data }) => <TableCell>{data?.folderName}</TableCell>,
  path: ({ data }) => <TableCell>{(data?.vm as VSphereVM)?.path}</TableCell>,
  powerState: PowerStateCellRenderer,
};

export const VSphereVirtualMachinesCells: React.FC<RowProps<VmData>> = ({
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
