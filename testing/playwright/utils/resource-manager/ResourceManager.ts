import type {
  IoK8sApiCoreV1Namespace,
  IoK8sApiCoreV1Secret,
  V1beta1ForkliftController,
  V1beta1Migration,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
  V1VirtualMachine,
} from '@forklift-ui/types';

import {
  FORKLIFT_API_VERSION,
  KUBEVIRT_API_VERSION,
  MTV_NAMESPACE,
  NAD_API_VERSION,
  NAMESPACE_API_VERSION,
  NAMESPACE_KIND,
  OPENSHIFT_PROJECT_API_VERSION,
  OPENSHIFT_PROJECT_KIND,
  RESOURCE_KINDS,
} from './constants';
import { ResourceCleaner } from './ResourceCleaner';
import {
  createNetworkMap,
  createProvider,
  createSecret,
  createStorageMap,
  type V1NetworkAttachmentDefinition,
} from './ResourceCreator';
import { ResourceFetcher } from './ResourceFetcher';
import { type JsonPatchOperation, type PatchType, ResourcePatcher } from './ResourcePatcher';

export type { V1NetworkAttachmentDefinition } from './ResourceCreator';
export type { JsonPatchOperation, PatchType } from './ResourcePatcher';

export type OpenshiftProject = IoK8sApiCoreV1Namespace & {
  kind: typeof OPENSHIFT_PROJECT_KIND;
  apiVersion: typeof OPENSHIFT_PROJECT_API_VERSION;
};

export type SupportedResource =
  | V1beta1ForkliftController
  | V1beta1Migration
  | V1beta1NetworkMap
  | V1beta1Plan
  | V1beta1Provider
  | V1beta1StorageMap
  | V1VirtualMachine
  | V1NetworkAttachmentDefinition
  | IoK8sApiCoreV1Namespace
  | IoK8sApiCoreV1Secret
  | OpenshiftProject;

/**
 * Main ResourceManager class that orchestrates resource management operations.
 * No browser Page is required — all API calls go through Node.js HTTP using
 * the session cookies saved by global.setup.ts.
 */
export class ResourceManager {
  private resources: SupportedResource[] = [];

  addNad(name: string, namespace: string): void {
    const nad: V1NetworkAttachmentDefinition = {
      apiVersion: NAD_API_VERSION,
      kind: RESOURCE_KINDS.NETWORK_ATTACHMENT_DEFINITION,
      metadata: {
        name,
        namespace,
      },
      spec: {
        config: '',
      },
    };
    this.addResource(nad);
  }

  addNetworkMap(name: string, namespace: string): void {
    const networkMap: V1beta1NetworkMap = {
      apiVersion: FORKLIFT_API_VERSION,
      kind: RESOURCE_KINDS.NETWORK_MAP,
      metadata: {
        name,
        namespace,
      },
    };
    this.addResource(networkMap);
  }

  addPlan(name: string, namespace: string): void {
    const plan: V1beta1Plan = {
      apiVersion: FORKLIFT_API_VERSION,
      kind: RESOURCE_KINDS.PLAN,
      metadata: {
        name,
        namespace,
      },
    };
    this.addResource(plan);
  }

  addProject(projectName: string, isOpenShift = true): void {
    const project: OpenshiftProject | IoK8sApiCoreV1Namespace = isOpenShift
      ? {
          kind: OPENSHIFT_PROJECT_KIND,
          apiVersion: OPENSHIFT_PROJECT_API_VERSION,
          metadata: {
            name: projectName,
          },
        }
      : {
          kind: NAMESPACE_KIND,
          apiVersion: NAMESPACE_API_VERSION,
          metadata: {
            name: projectName,
          },
        };

    this.addResource(project);
  }

  addProvider(name: string, namespace: string): void {
    const provider: V1beta1Provider = {
      apiVersion: FORKLIFT_API_VERSION,
      kind: RESOURCE_KINDS.PROVIDER,
      metadata: {
        name,
        namespace,
      },
    };
    this.addResource(provider);
  }

  addResource(resource: SupportedResource): void {
    this.resources.push(resource);
  }

  addSecret(name: string, namespace: string): void {
    const secret: IoK8sApiCoreV1Secret = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name,
        namespace,
      },
    };
    this.addResource(secret);
  }

  addStorageMap(name: string, namespace: string): void {
    const storageMap: V1beta1StorageMap = {
      apiVersion: FORKLIFT_API_VERSION,
      kind: RESOURCE_KINDS.STORAGE_MAP,
      metadata: {
        name,
        namespace,
      },
    };
    this.addResource(storageMap);
  }

  addVm(name: string, namespace: string): void {
    const vm: V1VirtualMachine = {
      apiVersion: KUBEVIRT_API_VERSION,
      kind: RESOURCE_KINDS.VIRTUAL_MACHINE,
      metadata: {
        name,
        namespace,
      },
      spec: {
        template: {},
      },
    };
    this.addResource(vm);
  }

  async cleanupAll(): Promise<void> {
    await ResourceCleaner.cleanupAll(this.resources);
    this.resources = [];
  }

  async createNetworkMap(
    networkMap: V1beta1NetworkMap,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1NetworkMap | null> {
    return createNetworkMap(networkMap, namespace);
  }

  async createProvider(
    provider: V1beta1Provider,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> {
    return createProvider(provider, namespace);
  }

  async createSecret(
    secret: IoK8sApiCoreV1Secret,
    namespace = MTV_NAMESPACE,
  ): Promise<IoK8sApiCoreV1Secret | null> {
    return createSecret(secret, namespace);
  }

  async createStorageMap(
    storageMap: V1beta1StorageMap,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1StorageMap | null> {
    return createStorageMap(storageMap, namespace);
  }

  async fetchForkliftController(
    controllerName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1ForkliftController | null> {
    return ResourceFetcher.fetchForkliftController(controllerName, namespace);
  }

  async fetchNetworkMap(
    networkMapName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1NetworkMap | null> {
    return ResourceFetcher.fetchNetworkMap(networkMapName, namespace);
  }

  async fetchPlan(planName: string, namespace = MTV_NAMESPACE): Promise<V1beta1Plan | null> {
    return ResourceFetcher.fetchPlan(planName, namespace);
  }

  async fetchProvider(
    providerName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> {
    return ResourceFetcher.fetchProvider(providerName, namespace);
  }

  async fetchStorageMap(
    storageMapName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1StorageMap | null> {
    return ResourceFetcher.fetchStorageMap(storageMapName, namespace);
  }

  async fetchVirtualMachine(vmName: string, namespace: string): Promise<V1VirtualMachine | null> {
    return ResourceFetcher.fetchVirtualMachine(vmName, namespace);
  }

  getResourceCount(): number {
    return this.resources.length;
  }

  loadResourcesFromFile(): void {
    this.resources = ResourceCleaner.loadResourcesFromFile();
  }

  async patchForkliftController(
    controllerName: string,
    patch: JsonPatchOperation[],
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1ForkliftController | null> {
    return ResourcePatcher.patchForkliftController(controllerName, patch, namespace);
  }

  async patchProvider(
    providerName: string,
    patch: Record<string, unknown>,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> {
    return ResourcePatcher.patchProvider(providerName, patch, namespace);
  }

  async patchResource<T extends SupportedResource>(options: {
    kind: string;
    resourceName: string;
    namespace: string;
    patch: Record<string, unknown> | JsonPatchOperation[];
    patchType?: PatchType;
  }): Promise<T | null> {
    return ResourcePatcher.patchResource<T>(options);
  }

  saveForLaterCleanup(): void {
    ResourceCleaner.saveResourcesToFile(this.resources);
  }
}
