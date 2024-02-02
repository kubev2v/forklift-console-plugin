import { useMemo } from 'react';

import {
  OpenShiftNetworkAttachmentDefinition,
  OpenstackNetwork,
  OVirtNetwork,
  ProviderType,
  V1beta1Provider,
  VSphereNetwork,
} from '@kubev2v/types';

import useProviderInventory from './useProviderInventory';

export type InventoryNetwork =
  | OpenShiftNetworkAttachmentDefinition
  | OpenstackNetwork
  | OVirtNetwork
  | VSphereNetwork;

export const useSourceNetworks = (
  provider: V1beta1Provider,
): [InventoryNetwork[], boolean, Error] => {
  const providerType: ProviderType = provider?.spec?.type as ProviderType;
  const {
    inventory: networks,
    loading,
    error,
  } = useProviderInventory<InventoryNetwork[]>({
    provider,
    subPath: providerType === 'openshift' ? '/networkattachmentdefinitions' : '/networks',
    disabled: !provider,
  });

  const typedNetworks = useMemo(
    () =>
      Array.isArray(networks)
        ? networks.map((net) => ({ ...net, providerType } as InventoryNetwork))
        : [],
    [networks],
  );

  return [typedNetworks, loading, error];
};

export const useOpenShiftNetworks = (
  provider: V1beta1Provider,
): [OpenShiftNetworkAttachmentDefinition[], boolean, Error] => {
  const isOpenShift = provider?.spec?.type === 'openshift';
  const {
    inventory: networks,
    loading,
    error,
  } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
    provider,
    subPath: '/networkattachmentdefinitions',
    disabled: !provider || !isOpenShift,
  });

  const typedNetworks: OpenShiftNetworkAttachmentDefinition[] = useMemo(
    () =>
      Array.isArray(networks) ? networks.map((net) => ({ ...net, providerType: 'openshift' })) : [],
    [networks],
  );

  return [typedNetworks, loading, error];
};
