import { useMemo } from 'react';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OpenstackNetwork,
  OvaNetwork,
  OVirtNetwork,
  ProviderType,
  V1beta1Provider,
  VSphereNetwork,
} from '@kubev2v/types';

import useProviderInventory from './useProviderInventory';

const podNetwork: InventoryNetwork = {
  id: 'pod',
  name: 'Pod network',
  namespace: '',
  object: undefined,
  providerType: 'openshift',
  selfLink: '',
  uid: 'pod',
  version: '',
};

export type InventoryNetwork =
  | OpenShiftNetworkAttachmentDefinition
  | OpenstackNetwork
  | OVirtNetwork
  | VSphereNetwork
  | OvaNetwork;

export const useSourceNetworks = (
  provider: V1beta1Provider,
): [InventoryNetwork[], boolean, Error] => {
  const providerType: ProviderType = provider?.spec?.type as ProviderType;
  const {
    error,
    inventory: networks,
    loading,
  } = useProviderInventory<InventoryNetwork[]>({
    disabled: !provider,
    provider,
    subPath: providerType === 'openshift' ? '/networkattachmentdefinitions' : '/networks',
  });

  const typedNetworks = useMemo(() => {
    const networksList = Array.isArray(networks)
      ? networks.map((net) => ({ ...net, providerType }) as InventoryNetwork)
      : [];

    if (Array.isArray(networks) && provider?.spec?.type === 'openshift') {
      networksList.push(podNetwork);
    }

    return networksList;
  }, [networks]);

  return [typedNetworks, loading, error];
};

export const useOpenShiftNetworks = (
  provider: V1beta1Provider,
): [OpenShiftNetworkAttachmentDefinition[], boolean, Error] => {
  const isOpenShift = provider?.spec?.type === 'openshift';
  const {
    error,
    inventory: networks,
    loading,
  } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
    disabled: !provider || !isOpenShift,
    provider,
    subPath: '/networkattachmentdefinitions',
  });

  const typedNetworks: OpenShiftNetworkAttachmentDefinition[] = useMemo(
    () =>
      Array.isArray(networks) ? networks.map((net) => ({ ...net, providerType: 'openshift' })) : [],
    [networks],
  );

  return [typedNetworks, loading, error];
};
