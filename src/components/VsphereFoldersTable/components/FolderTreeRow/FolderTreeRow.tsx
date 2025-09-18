import type { FC } from 'react';

import { nameColumn } from '@components/VsphereFoldersTable/utils/constants';
import type { FolderRow } from '@components/VsphereFoldersTable/utils/types';
import { Td, TreeRowWrapper } from '@patternfly/react-table';

import FolderNameCell from './FolderNameCell';

type FolderTreeRowProps = {
  row: FolderRow;
  groupVMCountByFolder: Map<string, number>;
};

const FolderTreeRow: FC<FolderTreeRowProps> = ({ groupVMCountByFolder, row }) => {
  return (
    <TreeRowWrapper data-testid={row.key} key={row.key} row={{ props: row?.treeRow?.props }}>
      <Td treeRow={row.treeRow} dataLabel={nameColumn.label}>
        <FolderNameCell row={row} vmCount={groupVMCountByFolder.get(row.folderName) ?? 0} />
      </Td>
    </TreeRowWrapper>
  );
};

export default FolderTreeRow;
