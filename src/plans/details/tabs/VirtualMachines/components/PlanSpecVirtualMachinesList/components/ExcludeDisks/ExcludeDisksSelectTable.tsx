import { type FC, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import { useForkliftTranslation } from 'src/utils/i18n';

import { excludeDiskFields } from './excludeDiskFields';
import ExcludeDiskRow from './ExcludeDiskRow';
import type { ExcludeDiskRowData } from './types';

const EXCLUDE_DISKS_TABLE_PAGE_ID = 'plan-vm-exclude-disks-table';

type ExcludeDisksSelectTableProps = {
  isLoading: boolean;
  loadError: Error | null;
  onSelect: (selectedIds: string[]) => void;
  rows: ExcludeDiskRowData[];
  selectedIds: string[];
};

const toId = (row: ExcludeDiskRowData): string => row.id;

const ExcludeDisksSelectTable: FC<ExcludeDisksSelectTableProps> = ({
  isLoading,
  loadError,
  onSelect,
  rows,
  selectedIds,
}) => {
  const { t } = useForkliftTranslation();
  const userSettings = useMemo(() => loadUserSettings({ pageId: EXCLUDE_DISKS_TABLE_PAGE_ID }), []);

  const inventoryRowCount = useMemo(() => rows.filter((row) => row.inInventory).length, [rows]);

  const getSelectDisabledReason = (row: ExcludeDiskRowData): string | undefined => {
    if (!row.inInventory) {
      return undefined;
    }

    if (inventoryRowCount <= 1) {
      return t('This VM has only one disk; it cannot be excluded.');
    }

    return undefined;
  };

  const canSelect = (row: ExcludeDiskRowData): boolean => {
    if (!row.inInventory) {
      return true;
    }

    return inventoryRowCount > 1;
  };

  return (
    <StandardPageWithSelection<ExcludeDiskRowData>
      canSelect={canSelect}
      cell={ExcludeDiskRow}
      dataSource={[rows, !isLoading, loadError]}
      fieldsMetadata={excludeDiskFields}
      getSelectDisabledReason={getSelectDisabledReason}
      noPadding
      onSelect={onSelect}
      pagination={10}
      selectedIds={selectedIds}
      showManageColumns={false}
      testId="exclude-disks-select-table"
      toId={toId}
      userSettings={userSettings}
    />
  );
};

export default ExcludeDisksSelectTable;
