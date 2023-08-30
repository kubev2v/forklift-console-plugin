import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { RowProps } from '@kubev2v/common';
import { VSphereVM } from '@kubev2v/types';
import { Tr } from '@patternfly/react-table';

import { VMCellProps } from './components';
import { defaultCellRenderers, renderTd, VmData } from './ProviderVirtualMachinesRow';

const cellRenderers: Record<string, React.FC<VMCellProps>> = {
  ...defaultCellRenderers,
  host: ({ data }) => <TableCell>{(data?.vm as VSphereVM)?.host}</TableCell>,
  isTemplate: ({ data }) => (
    <TableCell>{Boolean((data?.vm as VSphereVM)?.isTemplate).toString()}</TableCell>
  ),
  path: ({ data }) => <TableCell>{(data?.vm as VSphereVM)?.path}</TableCell>,
  status: ({ data }) => <TableCell>{(data?.vm as VSphereVM)?.powerState}</TableCell>,
};

export const VSphereVirtualMachinesRow: React.FC<RowProps<VmData>> = ({
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
