/* eslint-disable @typescript-eslint/promise-function-async */
import type { ProvidersInventoryList, V1beta1Provider } from '@kubev2v/types';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

import { getInventoryApiUrl } from '../../../modules/Providers/utils/helpers/getApiUrl';
import { k8sGetProvidersByNamespace } from '../utils/k8sGetProvidersByNamespace';
export const getProvidersInventoryByNamespace = async (
  currNamespace: string | undefined,
): Promise<ProvidersInventoryList | null> => {
  const newInventory: ProvidersInventoryList = {
    openshift: [],
    openstack: [],
    ova: [],
    ovirt: [],
    vsphere: [],
  };

  const providers = await k8sGetProvidersByNamespace(currNamespace);

  const readyProviders = providers?.filter(
    (provider: V1beta1Provider) => provider?.status?.phase === 'Ready',
  );

  const inventoryProviderURL = (provider: V1beta1Provider) =>
    `providers/${provider?.spec?.type}/${provider?.metadata?.uid}`;

  const inventoryReadyProviders = () => {
    return Promise.all(
      readyProviders.map((provider) => {
        return consoleFetchJSON(
          getInventoryApiUrl(inventoryProviderURL(provider)),
        ) as Promise<ProvidersInventoryList | null>;
      }),
    )
      .then((newInventoryProviders) => {
        newInventoryProviders.map((newInventoryProvider) =>
          newInventory[newInventoryProvider?.type].push(newInventoryProvider),
        );

        return newInventory;
      })
      .catch(() => {
        return null;
      });
  };

  return inventoryReadyProviders();
};
