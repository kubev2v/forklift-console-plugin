import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { RowProps } from '@kubev2v/common';
import { OVirtVM } from '@kubev2v/types';
import { Tr } from '@patternfly/react-table';

import { VMCellProps } from './components';
import { defaultCellRenderers, renderTd, VmData } from './ProviderVirtualMachinesRow';

const cellRenderers: Record<string, React.FC<VMCellProps>> = {
  ...defaultCellRenderers,
  host: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.host}</TableCell>,
  cluster: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.cluster}</TableCell>,
  path: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.path}</TableCell>,
  status: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.status}</TableCell>,
  description: ({ data }) => <TableCell>{(data?.vm as OVirtVM)?.description}</TableCell>,
};

export const OVirtVirtualMachinesRow: React.FC<RowProps<VmData>> = ({
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
