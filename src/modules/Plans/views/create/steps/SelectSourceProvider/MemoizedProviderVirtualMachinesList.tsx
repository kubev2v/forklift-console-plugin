import { memo } from 'react';
import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';

import { ProviderVirtualMachinesList } from '../../components/ProvidersVirtualMachinesList';

type ProviderVirtualMachinesListProps = {
  title: string;
  name: string;
  namespace: string;
  onSelect: (selectedVms: VmData[]) => void;
  initialSelectedIds: string[];
  showActions: boolean;
};

export const MemoizedProviderVirtualMachinesList = memo(
  ({
    initialSelectedIds,
    name,
    namespace,
    onSelect,
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
      />
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if selectedProviderName, selectedProviderNamespace
    return prevProps.name === nextProps.name && prevProps.namespace === nextProps.namespace;
  },
);

MemoizedProviderVirtualMachinesList.displayName = 'MemoizedProviderVirtualMachinesList';
