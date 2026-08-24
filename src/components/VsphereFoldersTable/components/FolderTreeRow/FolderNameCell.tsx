import type { FC } from 'react';

import type { FolderRow } from '@components/VsphereFoldersTable/utils/types';
import { Label, Split, SplitItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type FolderNameCellProps = { row: FolderRow; vmCount: number };

const FolderNameCell: FC<FolderNameCellProps> = ({ row, vmCount }) => {
  const { t } = useForkliftTranslation();

  return (
    <Split hasGutter>
      <SplitItem>{row.folderName}</SplitItem>
      <SplitItem>
        <Label data-testid={`folder-${row.folderName}-vm-count`} isCompact>
          {t('{{count}} VM', { count: vmCount })}
        </Label>
      </SplitItem>
    </Split>
  );
};

export default FolderNameCell;
