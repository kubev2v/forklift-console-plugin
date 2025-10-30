/* eslint-disable @typescript-eslint/promise-function-async */
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type {
  OpenshiftProvider,
  OpenstackProvider,
  OvaProvider,
  OVirtProvider,
  ProviderInventory,
  ProvidersInventoryList,
  V1beta1Provider,
  VSphereProvider,
} from '@kubev2v/types';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

import { getInventoryApiUrl } from '../../../modules/Providers/utils/helpers/getApiUrl';
import { k8sGetProvidersByNamespace } from '../utils/k8sGetProvidersByNamespace';
export const getProvidersInventoryByNamespace = async (
  currNamespace: string | undefined,
): Promise<ProvidersInventoryList | null> => {
  const providers = await k8sGetProvidersByNamespace(currNamespace);

  const readyProviders = providers?.filter(
    (provider: V1beta1Provider) => provider?.status?.phase === 'Ready',
  );

  const inventoryProviderURL = (provider: V1beta1Provider) =>
    `providers/${provider?.spec?.type}/${provider?.metadata?.uid}`;

  const inventoryReadyProviders = () => {
    return Promise.all(
      readyProviders.map((provider) => {
        return consoleFetchJSON(getInventoryApiUrl(inventoryProviderURL(provider))) as Promise<
          (ProviderInventory & { type: string }) | null
        >;
      }),
    )
      .then((newInventoryProviders) => {
        const newInventory: ProvidersInventoryList = {};

        newInventoryProviders.forEach((newInventoryProvider) => {
          if (newInventoryProvider?.type) {
            switch (newInventoryProvider.type) {
              case PROVIDER_TYPES.openshift:
                newInventory.openshift = [
                  ...(newInventory.openshift ?? []),
                  newInventoryProvider as OpenshiftProvider,
                ];
                break;
              case PROVIDER_TYPES.openstack:
                newInventory.openstack = [
                  ...(newInventory.openstack ?? []),
                  newInventoryProvider as OpenstackProvider,
                ];
                break;
              case PROVIDER_TYPES.ovirt:
                newInventory.ovirt = [
                  ...(newInventory.ovirt ?? []),
                  newInventoryProvider as OVirtProvider,
                ];
                break;
              case PROVIDER_TYPES.vsphere:
                newInventory.vsphere = [
                  ...(newInventory.vsphere ?? []),
                  newInventoryProvider as VSphereProvider,
                ];
                break;
              case PROVIDER_TYPES.ova:
                newInventory.ova = [
                  ...(newInventory.ova ?? []),
                  newInventoryProvider as OvaProvider,
                ];
                break;
              default:
                break;
            }
          }
        });

        return newInventory;
      })
      .catch(() => {
        return null;
      });
  };

  return inventoryReadyProviders();
};
