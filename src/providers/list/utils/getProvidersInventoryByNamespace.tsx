/* eslint-disable @typescript-eslint/promise-function-async */
import { buildProviderInventoryPath } from 'src/providers/hooks/utils/buildProviderInventoryPath';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { getInventoryApiUrl } from 'src/providers/utils/helpers/getApiUrl';
import { getType, getUID } from 'src/utils/crds/common/selectors';

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

import { k8sGetProvidersByNamespace } from '../utils/k8sGetProvidersByNamespace';

export const getProvidersInventoryByNamespace = async (
  currNamespace: string | undefined,
): Promise<ProvidersInventoryList | null> => {
  const providers = await k8sGetProvidersByNamespace(currNamespace);

  const readyProviders = providers?.filter(
    (provider: V1beta1Provider) => provider?.status?.phase === 'Ready',
  );

  const inventoryReadyProviders = () => {
    return Promise.all(
      readyProviders.map((provider) => {
        return consoleFetchJSON(
          getInventoryApiUrl(
            buildProviderInventoryPath(getType(provider) ?? '', getUID(provider) ?? ''),
          ),
        ) as Promise<(ProviderInventory & { type: string }) | null>;
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
              case PROVIDER_TYPES.hyperv:
                newInventory.hyperv = [
                  ...(newInventory.hyperv ?? []),
                  newInventoryProvider as HypervProvider,
                ];
                break;
              case PROVIDER_TYPES.ec2: {
                const extended = newInventory as ProvidersInventoryList &
                  Record<string, ProviderInventory[]>;
                extended.ec2 = [...(extended.ec2 ?? []), newInventoryProvider];
                break;
              }
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
