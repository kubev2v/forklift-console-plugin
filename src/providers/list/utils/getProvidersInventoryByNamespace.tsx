import type {
  HypervProvider,
  OpenshiftProvider,
  OpenstackProvider,
  OvaProvider,
  OVirtProvider,
  ProviderInventory,
  ProvidersInventoryList,
  V1beta1Provider,
  VSphereProvider,
} from '@forklift-ui/types';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { getInventoryApiUrl } from '@utils/api/getApiUrl';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { k8sGetProvidersByNamespace } from '../utils/k8sGetProvidersByNamespace';

const addProviderToInventory = (
  newInventory: ProvidersInventoryList,
  provider: ProviderInventory & { type: string },
): void => {
  switch (provider.type) {
    case PROVIDER_TYPES.openshift:
      newInventory.openshift = [...(newInventory.openshift ?? []), provider as OpenshiftProvider];
      break;
    case PROVIDER_TYPES.openstack:
      newInventory.openstack = [...(newInventory.openstack ?? []), provider as OpenstackProvider];
      break;
    case PROVIDER_TYPES.ovirt:
      newInventory.ovirt = [...(newInventory.ovirt ?? []), provider as OVirtProvider];
      break;
    case PROVIDER_TYPES.vsphere:
      newInventory.vsphere = [...(newInventory.vsphere ?? []), provider as VSphereProvider];
      break;
    case PROVIDER_TYPES.ova:
      newInventory.ova = [...(newInventory.ova ?? []), provider as OvaProvider];
      break;
    case PROVIDER_TYPES.hyperv:
      newInventory.hyperv = [...(newInventory.hyperv ?? []), provider as HypervProvider];
      break;
    case PROVIDER_TYPES.ec2: {
      const extended = newInventory as ProvidersInventoryList & Record<string, ProviderInventory[]>;
      extended.ec2 = [...(extended.ec2 ?? []), provider];
      break;
    }
    default:
      break;
  }
};

export const getProvidersInventoryByNamespace = async (
  currNamespace: string | undefined,
): Promise<ProvidersInventoryList | null> => {
  const providers = await k8sGetProvidersByNamespace(currNamespace);

  const readyProviders = providers?.filter(
    (provider: V1beta1Provider) => provider?.status?.phase === 'Ready',
  );

  const inventoryProviderURL = (provider: V1beta1Provider): string =>
    `providers/${provider?.spec?.type}/${provider?.metadata?.uid}`;

  const results = await Promise.allSettled(
    readyProviders.map(
      async (provider) =>
        consoleFetchJSON(getInventoryApiUrl(inventoryProviderURL(provider))) as Promise<
          (ProviderInventory & { type: string }) | null
        >,
    ),
  );

  const newInventory: ProvidersInventoryList = {};

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value?.type) {
      addProviderToInventory(newInventory, result.value);
    }
  }

  return newInventory;
};
