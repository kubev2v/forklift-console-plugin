import React, { memo } from 'react';
import { VmData } from 'src/modules/Providers/views';

import { ProviderVirtualMachinesList } from '../../components/ProvidersVirtualMachinesList';

export interface ProviderVirtualMachinesListProps {
  title: string;
  name: string;
  namespace: string;
  onSelect: (selectedVms: VmData[]) => void;
  initialSelectedIds: string[];
  showActions: boolean;
}

export const MemoizedProviderVirtualMachinesList = memo(
  ({
    title,
    name,
    namespace,
    onSelect,
    initialSelectedIds,
    showActions,
  }: ProviderVirtualMachinesListProps) => {
    return (
      <ProviderVirtualMachinesList
        title={title}
        name={name}
        namespace={namespace}
        onSelect={onSelect}
        initialSelectedIds={initialSelectedIds}
        showActions={showActions}
      />
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if selectedProviderName, selectedProviderNamespace
    return prevProps.name === nextProps.name && prevProps.namespace === nextProps.namespace;
  },
);

MemoizedProviderVirtualMachinesList.displayName = 'MemoizedProviderVirtualMachinesList';
