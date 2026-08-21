import { type FC, useCallback, useMemo, useState } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DISK_ENCRYPTION_TYPE } from '@utils/crds/conversion/constants';
import { isEmpty } from '@utils/helpers';

import { inspectionVmFields } from './utils/inspectionVmFields';
import type { InspectionVmRowData, VmOverrides } from './utils/types';
import InspectionVmRow from './InspectionVmRow';
import VmConfigForm from './VmConfigForm';

const INSPECTION_VM_TABLE_ID = 'inspection-vm-table';
const EMPTY_VM_OVERRIDES: Record<string, VmOverrides> = {};

const getDiskEncryptionLabel = (overrides?: VmOverrides): string | undefined => {
  if (overrides?.nbdeClevis) {
    return DISK_ENCRYPTION_TYPE.CLEVIS;
  }
  if (overrides?.passphrases?.some((phrase) => !isEmpty(phrase))) {
    return DISK_ENCRYPTION_TYPE.LUKS;
  }
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
  vmOverrides = EMPTY_VM_OVERRIDES,
  vmRows,
}) => {
  const { t } = useForkliftTranslation();
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
      if (!isProviderFlow || !onVmOverrideChange) {
        return null;
      }
      const vmId = props.resourceData.id;
      return (
        <VmConfigForm
          onChange={onVmOverrideChange}
          overrides={vmOverrides[vmId] ?? {}}
          vmId={vmId}
        />
      );
    },
    [isProviderFlow, vmOverrides, onVmOverrideChange],
  );

  const getSelectDisabledReason = useCallback(
    (item: InspectionVmRowData): string | undefined =>
      item.isActive ? t('This VM is already being inspected.') : undefined,
    [t],
  );

  return (
    <StandardPageWithSelection<InspectionVmRowData>
      canSelect={canSelect}
      cell={InspectionVmRow}
      dataSource={[enrichedRows, !isLoading, null]}
      fieldsMetadata={inspectionVmFields}
      getSelectDisabledReason={getSelectDisabledReason}
      onSelect={onSelect}
      selectedIds={selectedIds}
      toId={toId}
      userSettings={userSettings}
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
