import React from 'react';
import {
  ProviderVirtualMachinesListWrapper,
  useInventoryVms,
  VmData,
} from 'src/modules/Providers/views';

import { ProviderModelGroupVersionKind, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export const ProviderVirtualMachinesList: React.FC<{
  title: string;
  name: string;
  namespace: string;
  onSelect?: (selectedIds: VmData[]) => void;
  initialSelectedIds?: string[];
  showActions: boolean;
  className?: string;
}> = ({ title, name, namespace, onSelect, initialSelectedIds, showActions, className }) => {
  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const [vmData, vmDataLoading] = useInventoryVms({ provider }, providerLoaded, providerLoadError);
  const obj = { provider, vmData, vmDataLoading: vmDataLoading };

  return (
    <ProviderVirtualMachinesListWrapper
      title={title}
      obj={obj}
      loaded={providerLoaded}
      loadError={providerLoadError}
      onSelect={onSelect}
      initialSelectedIds={initialSelectedIds}
      showActions={showActions}
      className={className}
    />
  );
};
