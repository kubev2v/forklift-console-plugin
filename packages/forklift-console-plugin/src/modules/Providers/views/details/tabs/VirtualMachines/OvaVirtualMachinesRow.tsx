import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { RowProps } from '@kubev2v/common';
import { OvaVM } from '@kubev2v/types';
import { Tr } from '@patternfly/react-table';

import { VMCellProps } from './components';
import { defaultCellRenderers, renderTd, VmData } from './ProviderVirtualMachinesRow';

const cellRenderers: Record<string, React.FC<VMCellProps>> = {
  ...defaultCellRenderers,
  ovaPath: ({ data }) => <TableCell>{(data?.vm as OvaVM)?.OvaPath}</TableCell>,
};

export const OvaVirtualMachinesRow: React.FC<RowProps<VmData>> = ({
  resourceFields,
  resourceData,
}) => {
  return (
    <Tr>
      {resourceFields?.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields, cellRenderers }),
      )}
    </Tr>
  );
};
