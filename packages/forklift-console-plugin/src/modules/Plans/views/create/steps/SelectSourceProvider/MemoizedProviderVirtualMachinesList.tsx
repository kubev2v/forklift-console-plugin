import React, { memo } from 'react';
import { VmData } from 'src/modules/Providers/views';

import { ProviderVirtualMachinesList } from '../../components/ProvidersVirtualMachinesList';

export interface ProviderVirtualMachinesListProps {
  title: string;
  name: string;
  namespace: string;
  onSelect: (selectedVms: VmData[]) => void;
  initialSelectedIds: string[];
  disabledVmIds?: string[];
  showActions: boolean;
  selectedCountLabel?: (selectedIdCount: number) => string;
}

export const MemoizedProviderVirtualMachinesList = memo(
  ({
    title,
    name,
    namespace,
    onSelect,
    initialSelectedIds,
    disabledVmIds,
    showActions,
    selectedCountLabel,
  }: ProviderVirtualMachinesListProps) => {
    return (
      <ProviderVirtualMachinesList
        title={title}
        name={name}
        namespace={namespace}
        onSelect={onSelect}
        initialSelectedIds={initialSelectedIds}
        disabledVmIds={disabledVmIds}
        showActions={showActions}
        selectedCountLabel={selectedCountLabel}
      />
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if selectedProviderName, selectedProviderNamespace
    return prevProps.name === nextProps.name && prevProps.namespace === nextProps.namespace;
  },
);

MemoizedProviderVirtualMachinesList.displayName = 'MemoizedProviderVirtualMachinesList';
