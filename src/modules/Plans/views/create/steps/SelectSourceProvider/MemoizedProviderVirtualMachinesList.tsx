import React, { memo } from 'react';
import type { VmData } from 'src/modules/Providers/views';

import { ProviderVirtualMachinesList } from '../../components/ProvidersVirtualMachinesList';

export type ProviderVirtualMachinesListProps = {
  title: string;
  name: string;
  namespace: string;
  onSelect: (selectedVms: VmData[]) => void;
  initialSelectedIds: string[];
  showActions: boolean;
  selectedCountLabel?: (selectedIdCount: number) => string;
};

export const MemoizedProviderVirtualMachinesList = memo(
  ({
    initialSelectedIds,
    name,
    namespace,
    onSelect,
    selectedCountLabel,
    showActions,
    title,
  }: ProviderVirtualMachinesListProps) => {
    return (
      <ProviderVirtualMachinesList
        title={title}
        name={name}
        namespace={namespace}
        onSelect={onSelect}
        initialSelectedIds={initialSelectedIds}
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
