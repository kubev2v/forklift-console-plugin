import { useMemo } from 'react';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OpenstackNetwork,
  OvaNetwork,
  OVirtNetwork,
  ProviderType,
  V1beta1Provider,
  V1NetworkAttachmentDefinition,
  VSphereNetwork,
} from '@forklift-ui/types';
import { POD } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';
import type { Ec2Network } from '@utils/types/ec2Inventory';

import useProviderInventory from './useProviderInventory';

export type InventoryNetwork =
  | (Omit<OpenShiftNetworkAttachmentDefinition, 'object'> & {
      object: V1NetworkAttachmentDefinition | undefined;
    })
  | OpenstackNetwork
  | OVirtNetwork
  | VSphereNetwork
  | OvaNetwork
  | Ec2Network;

export const useSourceNetworks = (
  provider: V1beta1Provider | undefined,
): [InventoryNetwork[], boolean, Error | null] => {
  const { t } = useForkliftTranslation();
  const defaultNetworkLabel = t('Default network');
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
      networksList.push({
        id: POD,
        name: defaultNetworkLabel,
        namespace: '',
        object: undefined,
        providerType: 'openshift',
        selfLink: '',
        uid: POD,
        version: '',
      });
    }

    return networksList;
  }, [defaultNetworkLabel, networks, provider?.spec?.type, providerType]);

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
