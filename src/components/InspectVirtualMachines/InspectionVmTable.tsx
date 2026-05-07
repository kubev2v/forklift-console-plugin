import { type FC, useCallback, useMemo, useState } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';

import { DISK_ENCRYPTION_TYPE } from '@utils/crds/conversion/constants';
import { isEmpty } from '@utils/helpers';

import { inspectionVmFields } from './utils/inspectionVmFields';
import type { InspectionVmRowData, VmOverrides } from './utils/types';
import InspectionVmRow from './InspectionVmRow';
import VmConfigForm from './VmConfigForm';

const INSPECTION_VM_TABLE_ID = 'inspection-vm-table';

const getDiskEncryptionLabel = (overrides?: VmOverrides): string | undefined => {
  if (overrides?.nbdeClevis) return DISK_ENCRYPTION_TYPE.CLEVIS;
  if (overrides?.passphrases?.some((phrase) => !isEmpty(phrase))) return DISK_ENCRYPTION_TYPE.LUKS;
  return undefined;
};

type InspectionVmTableProps = {
  isLoading?: boolean;
  isProviderFlow?: boolean;
  onSelect: (selectedIds: string[]) => void;
  onVmOverrideChange?: (vmId: string, overrides: VmOverrides) => void;
  selectedIds: string[];
  vmOverrides?: Record<string, VmOverrides>;
  vmRows: InspectionVmRowData[];
};

const toId = (item: InspectionVmRowData): string => item.id;

const canSelect = (item: InspectionVmRowData): boolean => !item.isActive;

const InspectionVmTable: FC<InspectionVmTableProps> = ({
  isLoading = false,
  isProviderFlow = false,
  onSelect,
  onVmOverrideChange,
  selectedIds,
  vmOverrides = {},
  vmRows,
}) => {
  const userSettings = useMemo(() => loadUserSettings({ pageId: INSPECTION_VM_TABLE_ID }), []);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const enrichedRows = useMemo(
    () =>
      vmRows.map((row) => {
        const overrides = vmOverrides[row.id];
        return { ...row, diskEncryptionLabel: getDiskEncryptionLabel(overrides) };
      }),
    [vmRows, vmOverrides],
  );

  const expanded = useCallback(
    (props: { resourceData: InspectionVmRowData }) => {
      if (!isProviderFlow || !onVmOverrideChange) return null;
      const vmId = props.resourceData.id;
      return (
        <VmConfigForm
          vmId={vmId}
          overrides={vmOverrides[vmId] ?? {}}
          onChange={onVmOverrideChange}
        />
      );
    },
    [isProviderFlow, vmOverrides, onVmOverrideChange],
  );

  return (
    <StandardPageWithSelection<InspectionVmRowData>
      dataSource={[enrichedRows, !isLoading, null]}
      cell={InspectionVmRow}
      fieldsMetadata={inspectionVmFields}
      userSettings={userSettings}
      toId={toId}
      canSelect={canSelect}
      onSelect={onSelect}
      selectedIds={selectedIds}
      {...(isProviderFlow && {
        expanded,
        expandedIds,
        onExpand: setExpandedIds,
      })}
      data-testid="inspection-vm-table"
    />
  );
};

export default InspectionVmTable;
