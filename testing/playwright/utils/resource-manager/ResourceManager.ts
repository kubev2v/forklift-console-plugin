import { ResourceCleaner } from './ResourceCleaner';
import {
  buildNad,
  buildNetworkMap,
  buildPlan,
  buildProject,
  buildProvider,
  buildSecret,
  buildStorageMap,
  buildVirtualMachine,
} from './resourceFactories';
import { resourceManagerApi } from './resourceManagerApi';
import type { SupportedResource } from './types';

/**
 * Main ResourceManager class that orchestrates resource management operations.
 * No browser Page is required — all API calls go through Node.js HTTP using
 * the session cookies saved by global.setup.ts.
 */
export class ResourceManager {
  private resources: SupportedResource[] = [];

  // API facade — arrow fields avoid class-methods-use-this while preserving instance API
  createNetworkMap = resourceManagerApi.createNetworkMap;
  createProvider = resourceManagerApi.createProvider;
  createSecret = resourceManagerApi.createSecret;
  createStorageMap = resourceManagerApi.createStorageMap;
  fetchForkliftController = resourceManagerApi.fetchForkliftController;
  fetchNetworkMap = resourceManagerApi.fetchNetworkMap;
  fetchPlan = resourceManagerApi.fetchPlan;
  fetchProvider = resourceManagerApi.fetchProvider;
  fetchStorageMap = resourceManagerApi.fetchStorageMap;
  fetchVirtualMachine = resourceManagerApi.fetchVirtualMachine;
  patchForkliftController = resourceManagerApi.patchForkliftController;
  patchProvider = resourceManagerApi.patchProvider;
  patchResource = resourceManagerApi.patchResource;

  addNad(name: string, namespace: string): void {
    this.addResource(buildNad(name, namespace));
  }

  addNetworkMap(name: string, namespace: string): void {
    this.addResource(buildNetworkMap(name, namespace));
  }

  addPlan(name: string, namespace: string): void {
    this.addResource(buildPlan(name, namespace));
  }

  addProject(projectName: string, isOpenShift = true): void {
    this.addResource(buildProject(projectName, isOpenShift));
  }

  addProvider(name: string, namespace: string): void {
    this.addResource(buildProvider(name, namespace));
  }

  addResource(resource: SupportedResource): void {
    this.resources.push(resource);
  }

  addSecret(name: string, namespace: string): void {
    this.addResource(buildSecret(name, namespace));
  }

  addStorageMap(name: string, namespace: string): void {
    this.addResource(buildStorageMap(name, namespace));
  }

  addVm(name: string, namespace: string): void {
    this.addResource(buildVirtualMachine(name, namespace));
  }

  async cleanupAll(): Promise<void> {
    await ResourceCleaner.cleanupAll(this.resources);
    this.resources = [];
  }

  getResourceCount(): number {
    return this.resources.length;
  }

  loadResourcesFromFile(): void {
    this.resources = ResourceCleaner.loadResourcesFromFile();
  }

  saveForLaterCleanup(): void {
    ResourceCleaner.saveResourcesToFile(this.resources);
  }
}
