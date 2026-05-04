import { type FC, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';

import { inspectionVmFields } from './utils/inspectionVmFields';
import type { InspectionVmRowData } from './utils/normalizeVmsForInspection';
import InspectionVmRow from './InspectionVmRow';

const INSPECTION_VM_TABLE_ID = 'inspection-vm-table';

type InspectionVmTableProps = {
  isLoading?: boolean;
  onSelect: (selectedIds: string[]) => void;
  selectedIds: string[];
  vmRows: InspectionVmRowData[];
};

const toId = (item: InspectionVmRowData): string => item.id;

const canSelect = (item: InspectionVmRowData): boolean => !item.isActive;

const InspectionVmTable: FC<InspectionVmTableProps> = ({
  isLoading = false,
  onSelect,
  selectedIds,
  vmRows,
}) => {
  const userSettings = useMemo(() => loadUserSettings({ pageId: INSPECTION_VM_TABLE_ID }), []);

  return (
    <StandardPageWithSelection<InspectionVmRowData>
      dataSource={[vmRows, !isLoading, null]}
      cell={InspectionVmRow}
      fieldsMetadata={inspectionVmFields}
      userSettings={userSettings}
      toId={toId}
      canSelect={canSelect}
      onSelect={onSelect}
      selectedIds={selectedIds}
      data-testid="inspection-vm-table"
    />
  );
};

export default InspectionVmTable;
