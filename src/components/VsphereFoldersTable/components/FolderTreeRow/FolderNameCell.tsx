import type { FC } from 'react';

import type { FolderRow } from '@components/VsphereFoldersTable/utils/types';
import { Label, Split, SplitItem } from '@patternfly/react-core';

type FolderNameCellProps = { row: FolderRow; vmCount: number };

const FolderNameCell: FC<FolderNameCellProps> = ({ row, vmCount }) => {
  return (
    <Split hasGutter>
      <SplitItem>{row.folderName}</SplitItem>
      <SplitItem>
        <Label isCompact>{vmCount} VMs</Label>
      </SplitItem>
    </Split>
  );
};

export default FolderNameCell;
