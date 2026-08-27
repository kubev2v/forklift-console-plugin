import type {
  IoK8sApiCoreV1Secret,
  V1beta1ForkliftController,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
  V1VirtualMachine,
} from '@forklift-ui/types';

import { MTV_NAMESPACE } from './constants';
import {
  createNetworkMap,
  createProvider,
  createSecret,
  createStorageMap,
} from './ResourceCreator';
import { ResourceFetcher } from './ResourceFetcher';
import { type JsonPatchOperation, type PatchType, ResourcePatcher } from './ResourcePatcher';
import type { SupportedResource } from './types';

export const resourceManagerApi = {
  createNetworkMap: async (
    networkMap: V1beta1NetworkMap,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1NetworkMap | null> => createNetworkMap(networkMap, namespace),
  createProvider: async (
    provider: V1beta1Provider,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> => createProvider(provider, namespace),
  createSecret: async (
    secret: IoK8sApiCoreV1Secret,
    namespace = MTV_NAMESPACE,
  ): Promise<IoK8sApiCoreV1Secret | null> => createSecret(secret, namespace),
  createStorageMap: async (
    storageMap: V1beta1StorageMap,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1StorageMap | null> => createStorageMap(storageMap, namespace),
  fetchForkliftController: async (
    controllerName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1ForkliftController | null> =>
    ResourceFetcher.fetchForkliftController(controllerName, namespace),
  fetchNetworkMap: async (
    networkMapName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1NetworkMap | null> =>
    ResourceFetcher.fetchNetworkMap(networkMapName, namespace),
  fetchPlan: async (planName: string, namespace = MTV_NAMESPACE): Promise<V1beta1Plan | null> =>
    ResourceFetcher.fetchPlan(planName, namespace),
  fetchProvider: async (
    providerName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> => ResourceFetcher.fetchProvider(providerName, namespace),
  fetchStorageMap: async (
    storageMapName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1StorageMap | null> =>
    ResourceFetcher.fetchStorageMap(storageMapName, namespace),
  fetchVirtualMachine: async (
    vmName: string,
    namespace: string,
  ): Promise<V1VirtualMachine | null> => ResourceFetcher.fetchVirtualMachine(vmName, namespace),
  patchForkliftController: async (
    controllerName: string,
    patch: JsonPatchOperation[],
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1ForkliftController | null> =>
    ResourcePatcher.patchForkliftController(controllerName, patch, namespace),
  patchProvider: async (
    providerName: string,
    patch: Record<string, unknown>,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> =>
    ResourcePatcher.patchProvider(providerName, patch, namespace),
  patchResource: async <T extends SupportedResource>(options: {
    kind: string;
    namespace: string;
    patch: Record<string, unknown> | JsonPatchOperation[];
    patchType?: PatchType;
    resourceName: string;
  }): Promise<T | null> => ResourcePatcher.patchResource<T>(options),
};
