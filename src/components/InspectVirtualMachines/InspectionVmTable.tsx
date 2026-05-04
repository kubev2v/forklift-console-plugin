import { type FC, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';

import { inspectionVmFields } from './utils/inspectionVmFields';
import InspectionVmRow from './InspectionVmRow';

const INSPECTION_VM_TABLE_ID = 'inspection-vm-table';

type InspectionVmRowData = {
  id: string;
  isActive: boolean;
  name: string;
  phase?: string;
  timestamp?: string;
};

type InspectionVmTableProps = {
  onSelect: (selectedIds: string[]) => void;
  selectedIds: string[];
  vmRows: InspectionVmRowData[];
};

const toId = (item: InspectionVmRowData): string => item.id;

const canSelect = (item: InspectionVmRowData): boolean => !item.isActive;

const InspectionVmTable: FC<InspectionVmTableProps> = ({ onSelect, selectedIds, vmRows }) => {
  const userSettings = useMemo(() => loadUserSettings({ pageId: INSPECTION_VM_TABLE_ID }), []);

  return (
    <StandardPageWithSelection<InspectionVmRowData>
      dataSource={[vmRows, true, null]}
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
