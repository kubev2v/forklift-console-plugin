import type {
  IoK8sApiCoreV1Namespace,
  V1beta1Migration,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1VirtualMachine,
} from '@kubev2v/types';
import type { Page } from '@playwright/test';

import {
  DEFAULT_NAMESPACE,
  FORKLIFT_API_VERSION,
  KUBEVIRT_API_VERSION,
  NAMESPACE_API_VERSION,
  NAMESPACE_KIND,
  OPENSHIFT_PROJECT_API_VERSION,
  OPENSHIFT_PROJECT_KIND,
  RESOURCE_KINDS,
} from './constants';
import { ResourceCleaner } from './ResourceCleaner';
import { ResourceFetcher } from './ResourceFetcher';

export type OpenshiftProject = IoK8sApiCoreV1Namespace & {
  kind: typeof OPENSHIFT_PROJECT_KIND;
  apiVersion: typeof OPENSHIFT_PROJECT_API_VERSION;
};

export type SupportedResource =
  | V1beta1Migration
  | V1beta1NetworkMap
  | V1beta1Plan
  | V1beta1Provider
  | V1VirtualMachine
  | IoK8sApiCoreV1Namespace
  | OpenshiftProject;

/**
 * Main ResourceManager class that orchestrates resource management operations
 */
export class ResourceManager {
  private resources: SupportedResource[] = [];

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

  async fetchProvider(
    page: Page,
    providerName: string,
    namespace = DEFAULT_NAMESPACE,
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

  saveForLaterCleanup(): void {
    ResourceCleaner.saveResourcesToFile(this.resources);
  }
}
