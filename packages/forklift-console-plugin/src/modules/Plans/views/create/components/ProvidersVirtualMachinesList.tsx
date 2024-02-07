import React from 'react';
import { useProviderInventory } from 'src/modules/Providers/hooks';
import { ProviderVirtualMachinesListWrapper, VmData } from 'src/modules/Providers/views';

import { ProviderInventory, ProviderModelGroupVersionKind, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export const ProviderVirtualMachinesList: React.FC<{
  title: string;
  name: string;
  namespace: string;
  onSelect?: (selectedIds: VmData[]) => void;
  initialSelectedIds?: string[];
  className?: string;
}> = ({ title, name, namespace, onSelect, initialSelectedIds, className }) => {
  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const { inventory } = useProviderInventory<ProviderInventory>({ provider });
  const obj = { provider, inventory };

  return (
    <ProviderVirtualMachinesListWrapper
      title={title}
      obj={obj}
      loaded={providerLoaded}
      loadError={providerLoadError}
      onSelect={onSelect}
      initialSelectedIds={initialSelectedIds}
      className={className}
    />
  );
};
