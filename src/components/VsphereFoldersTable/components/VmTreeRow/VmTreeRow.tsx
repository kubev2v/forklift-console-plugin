import type { FC } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import VirtualMachineConcernsCell from '@components/Concerns/VirtualMachineConcernsCell';
import VirtualMachinePowerStateCell from '@components/PowerState/VirtualMachinePowerStateCell';
import { nameColumn } from '@components/VsphereFoldersTable/utils/constants';
import type { VmRow } from '@components/VsphereFoldersTable/utils/types';
import type { VSphereVM } from '@kubev2v/types';
import { Td, TreeRowWrapper } from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';

type VmTreeRowProps = {
  row: VmRow;
  columns: ResourceField[];
};

const VmCells: Record<string, FC<{ row: VmRow }>> = {
  concerns: ({ row }) => <VirtualMachineConcernsCell vmData={row.vmData} />,
  host: ({ row }) => <>{row.vmData.hostName ?? EMPTY_MSG}</>,
  path: ({ row }) => <>{(row.vmData.vm as VSphereVM).path ?? EMPTY_MSG}</>,
  power: ({ row }) => <VirtualMachinePowerStateCell vmData={row.vmData} />,
};

const VmTreeRow: FC<VmTreeRowProps> = ({ columns, row }) => {
  return (
    <TreeRowWrapper data-testid={row.key} key={row.key} row={{ props: row?.treeRow?.props }}>
      <Td treeRow={row.treeRow} dataLabel={nameColumn.label}>
        {row.vmData.name}
      </Td>
      {columns.map((col) => {
        if (!col.isVisible) return null;
        const Component = VmCells[col.resourceFieldId!];
        return (
          <Td key={col.resourceFieldId} dataLabel={col.label ?? ''}>
            <Component row={row} />
          </Td>
        );
      })}
    </TreeRowWrapper>
  );
};

export default VmTreeRow;
