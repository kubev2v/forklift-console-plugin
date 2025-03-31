import React from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils';

import type { ResourceField } from '@components/common/utils/types';
import type { OvaVM } from '@kubev2v/types';
import { Td } from '@patternfly/react-table';

import {
  type VMCellProps,
  VMConcernsCellRenderer,
  type VmData,
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

type RenderTdProps = {
  resourceData: VmData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};
const cellRenderers: Record<string, React.FC<VMCellProps>> = {
  concerns: VMConcernsCellRenderer,
  name: VMNameCellRenderer,
  ovaPath: ({ data }) => <TableCell>{(data?.vm as OvaVM)?.OvaPath}</TableCell>,
};

export const OvaVirtualMachinesCells: React.FC<RowProps<VmData>> = ({
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
