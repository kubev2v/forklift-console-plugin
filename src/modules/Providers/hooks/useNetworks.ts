import { useMemo } from 'react';
import { POD } from 'src/plans/details/utils/constants';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OpenstackNetwork,
  OvaNetwork,
  OVirtNetwork,
  ProviderType,
  V1beta1Provider,
  V1NetworkAttachmentDefinition,
  VSphereNetwork,
} from '@kubev2v/types';
import { DEFAULT_NETWORK } from '@utils/constants';

import useProviderInventory from './useProviderInventory';

const podNetwork: InventoryNetwork = {
  id: POD,
  name: DEFAULT_NETWORK,
  namespace: '',
  object: undefined,
  providerType: 'openshift',
  selfLink: '',
  uid: POD,
  version: '',
};

export type InventoryNetwork =
  | (Omit<OpenShiftNetworkAttachmentDefinition, 'object'> & {
      object: V1NetworkAttachmentDefinition | undefined;
    })
  | OpenstackNetwork
  | OVirtNetwork
  | VSphereNetwork
  | OvaNetwork;

export const useSourceNetworks = (
  provider: V1beta1Provider | undefined,
): [InventoryNetwork[], boolean, Error | null] => {
  const providerType: ProviderType = provider?.spec?.type as ProviderType;
  const {
    error,
    inventory: networks,
    loading,
  } = useProviderInventory<InventoryNetwork[]>({
    disabled: !provider,
    provider,
    subPath: providerType === 'openshift' ? 'networkattachmentdefinitions' : 'networks',
  });

  const typedNetworks = useMemo(() => {
    const networksList = Array.isArray(networks)
      ? networks.map((net) => ({ ...net, providerType }) as InventoryNetwork)
      : [];

    if (Array.isArray(networks) && provider?.spec?.type === 'openshift') {
      networksList.push(podNetwork);
    }

    return networksList;
  }, [networks, provider?.spec?.type, providerType]);

  return [typedNetworks, loading, error];
};

export const useOpenShiftNetworks = (
  provider: V1beta1Provider | undefined,
): [OpenShiftNetworkAttachmentDefinition[], boolean, Error | null] => {
  const isOpenShift = provider?.spec?.type === 'openshift';
  const {
    error,
    inventory: networks,
    loading,
  } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
    disabled: !provider || !isOpenShift,
    provider,
    subPath: 'networkattachmentdefinitions',
  });

  const typedNetworks: OpenShiftNetworkAttachmentDefinition[] = useMemo(
    () =>
      Array.isArray(networks) ? networks.map((net) => ({ ...net, providerType: 'openshift' })) : [],
    [networks],
  );

  return [typedNetworks, loading, error];
};
