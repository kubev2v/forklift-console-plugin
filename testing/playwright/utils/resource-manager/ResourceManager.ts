import type {
  IoK8sApiCoreV1Namespace,
  IoK8sApiCoreV1Secret,
  V1beta1ForkliftController,
  V1beta1Migration,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1VirtualMachine,
} from '@forklift-ui/types';
import type { Page } from '@playwright/test';

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
  createProvider,
  createSecret,
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
  | V1VirtualMachine
  | V1NetworkAttachmentDefinition
  | IoK8sApiCoreV1Namespace
  | IoK8sApiCoreV1Secret
  | OpenshiftProject;

/**
 * Main ResourceManager class that orchestrates resource management operations
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
      ? ({
          kind: OPENSHIFT_PROJECT_KIND,
          apiVersion: OPENSHIFT_PROJECT_API_VERSION,
          metadata: {
            name: projectName,
          },
        } as OpenshiftProject)
      : ({
          kind: NAMESPACE_KIND,
          apiVersion: NAMESPACE_API_VERSION,
          metadata: {
            name: projectName,
          },
        } as IoK8sApiCoreV1Namespace);

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

  async cleanupAll(page: Page): Promise<void> {
    await ResourceCleaner.cleanupAll(page, this.resources);
    this.resources = [];
  }

  async createProvider(
    page: Page,
    provider: V1beta1Provider,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> {
    return createProvider(page, provider, namespace);
  }

  async createSecret(
    page: Page,
    secret: IoK8sApiCoreV1Secret,
    namespace = MTV_NAMESPACE,
  ): Promise<IoK8sApiCoreV1Secret | null> {
    return createSecret(page, secret, namespace);
  }

  async fetchForkliftController(
    page: Page,
    controllerName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1ForkliftController | null> {
    return ResourceFetcher.fetchForkliftController(page, controllerName, namespace);
  }

  async fetchPlan(
    page: Page,
    planName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Plan | null> {
    return ResourceFetcher.fetchResource<V1beta1Plan>(page, {
      kind: RESOURCE_KINDS.PLAN,
      resourceName: planName,
      namespace,
    });
  }

  async fetchProvider(
    page: Page,
    providerName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> {
    return ResourceFetcher.fetchProvider(page, providerName, namespace);
  }

  async fetchVirtualMachine(
    page: Page,
    vmName: string,
    namespace: string,
  ): Promise<V1VirtualMachine | null> {
    return ResourceFetcher.fetchVirtualMachine(page, vmName, namespace);
  }

  getResourceCount(): number {
    return this.resources.length;
  }

  async instantCleanup(
    baseUrl = process.env.BRIDGE_BASE_ADDRESS ??
      process.env.BASE_ADDRESS ??
      'http://localhost:9000',
    storageStatePath?: string,
  ): Promise<void> {
    await ResourceCleaner.instantCleanup(this.resources, baseUrl, storageStatePath);
    this.resources = [];
  }

  loadResourcesFromFile(): void {
    this.resources = ResourceCleaner.loadResourcesFromFile();
  }

  async patchForkliftController(
    page: Page,
    controllerName: string,
    patch: JsonPatchOperation[],
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1ForkliftController | null> {
    return ResourcePatcher.patchForkliftController(page, controllerName, patch, namespace);
  }

  async patchProvider(
    page: Page,
    providerName: string,
    patch: Record<string, any>,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> {
    return ResourcePatcher.patchProvider(page, providerName, patch, namespace);
  }

  /**
   * Patches a Kubernetes resource using either merge patch or JSON patch.
   * @param page - Playwright page
   * @param options.kind - Resource kind (e.g., 'Plan', 'Provider')
   * @param options.resourceName - Name of the resource
   * @param options.namespace - Namespace of the resource
   * @param options.patch - Patch data (object for merge, array of JsonPatchOperation for json)
   * @param options.patchType - 'merge' (default) or 'json' for array operations
   */
  async patchResource<T extends SupportedResource>(
    page: Page,
    options: {
      kind: string;
      resourceName: string;
      namespace: string;
      patch: Record<string, any> | JsonPatchOperation[];
      patchType?: PatchType;
    },
  ): Promise<T | null> {
    return ResourcePatcher.patchResource<T>(page, options);
  }

  saveForLaterCleanup(): void {
    ResourceCleaner.saveResourcesToFile(this.resources);
  }
}
