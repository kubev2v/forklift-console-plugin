import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useProviderInventory } from 'src/modules/Providers/hooks';
import { ProviderData } from 'src/modules/Providers/utils';

import { ProviderInventory, ProviderModelGroupVersionKind, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { OpenShiftVirtualMachinesList } from './OpenShiftVirtualMachinesList';
import { OpenStackVirtualMachinesList } from './OpenStackVirtualMachinesList';
import { OvaVirtualMachinesList } from './OvaVirtualMachinesList';
import { OVirtVirtualMachinesList } from './OVirtVirtualMachinesList';
import { VSphereVirtualMachinesList } from './VSphereVirtualMachinesList';

export interface ProviderVirtualMachinesProps extends RouteComponentProps {
  obj: ProviderData;
  loaded?: boolean;
  loadError?: unknown;
}

export const ProviderVirtualMachinesWrapper: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const { inventory } = useProviderInventory<ProviderInventory>({ provider });

  const data = { provider, inventory };
  switch (provider?.spec?.type) {
    case 'openshift':
      return (
        <OpenShiftVirtualMachinesList
          obj={data}
          loaded={providerLoaded}
          loadError={providerLoadError}
        />
      );
    case 'openstack':
      return (
        <OpenStackVirtualMachinesList
          obj={data}
          loaded={providerLoaded}
          loadError={providerLoadError}
        />
      );
    case 'ovirt':
      return (
        <OVirtVirtualMachinesList
          obj={data}
          loaded={providerLoaded}
          loadError={providerLoadError}
        />
      );
    case 'vsphere':
      return (
        <VSphereVirtualMachinesList
          obj={data}
          loaded={providerLoaded}
          loadError={providerLoadError}
        />
      );
    case 'ova':
      return <OvaVirtualMachinesList obj={data} loaded={providerLoaded} />;
    default:
      // unsupported provider or loading errors will be handled by parent page
      return <></>;
  }
};
