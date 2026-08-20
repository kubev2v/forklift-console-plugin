import type { FC } from 'react';

import { nameColumn } from '@components/VsphereFoldersTable/utils/constants';
import type { FolderRow } from '@components/VsphereFoldersTable/utils/types';
import { Td, TreeRowWrapper } from '@patternfly/react-table';

import FolderNameCell from './FolderNameCell';

type FolderTreeRowProps = {
  groupVMCountByFolder: Map<string, number>;
  row: FolderRow;
};

const FolderTreeRow: FC<FolderTreeRowProps> = ({ groupVMCountByFolder, row }) => {
  return (
    <TreeRowWrapper
      data-testid={row.key}
      key={row.key}
      row={{ props: row.treeRow?.props as object | undefined }}
    >
      <Td data-testid={`${row.key}-expand-cell`} dataLabel={nameColumn.label} treeRow={row.treeRow}>
        <FolderNameCell row={row} vmCount={groupVMCountByFolder.get(row.folderName) ?? 0} />
      </Td>
    </TreeRowWrapper>
  );
};

export default FolderTreeRow;
