import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { isEmpty } from '../utils';

import { BaseResourceManager } from './BaseResourceManager';
import {
  API_PATHS,
  MTV_NAMESPACE,
  RESOURCE_KINDS,
  RESOURCE_TYPES,
  RESOURCES_FILE,
} from './constants';
import type { SupportedResource } from './ResourceManager';

/**
 * Deletion groups ordered by dependency: resources in later groups may reference
 * resources in earlier groups, so earlier groups must be deleted first.
 * Within each group all deletions run in parallel.
 */
const CLEANUP_GROUPS = [
  // Group 1: execution resources — reference providers, maps, and each other
  [RESOURCE_KINDS.MIGRATION, RESOURCE_KINDS.PLAN],
  // Group 2: configuration resources — referenced by plans
  [
    RESOURCE_KINDS.NETWORK_MAP,
    RESOURCE_KINDS.STORAGE_MAP,
    RESOURCE_KINDS.PROVIDER,
    RESOURCE_KINDS.SECRET,
    RESOURCE_KINDS.FORKLIFT_CONTROLLER,
  ],
  // Group 3: workload resources
  [RESOURCE_KINDS.VIRTUAL_MACHINE, RESOURCE_KINDS.NETWORK_ATTACHMENT_DEFINITION],
  // Group 4: namespaces / projects must be last (deleting them cascades everything inside)
  [RESOURCE_KINDS.NAMESPACE, RESOURCE_KINDS.PROJECT],
] as const;

/**
 * Handles cleanup and deletion of Kubernetes resources.
 * All operations use Node.js HTTP directly — no browser Page required.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourceCleaner extends BaseResourceManager {
  static async cleanupAll(resources: SupportedResource[]): Promise<void> {
    if (isEmpty(resources)) {
      console.log('No resources to cleanup');
      return;
    }

    // Index resources by kind for O(1) group lookup
    const byKind = new Map<string, SupportedResource[]>();
    for (const resource of resources) {
      const kind = resource.kind ?? 'unknown';
      const bucket = byKind.get(kind) ?? [];
      bucket.push(resource);
      byKind.set(kind, bucket);
    }

    let deletedCount = 0;
    let skippedCount = 0;
    let failureCount = 0;

    const processResults = (results: PromiseSettledResult<{ skipped: boolean }>[]) => {
      for (const result of results) {
        if (result.status === 'fulfilled') {
          if (result.value.skipped) {
            skippedCount += 1;
          } else {
            deletedCount += 1;
          }
        } else {
          failureCount += 1;
        }
      }
    };

    // Delete in dependency order — each group waits for the previous to finish
    for (const group of CLEANUP_GROUPS) {
      const groupResources = group.flatMap((kind) => byKind.get(kind) ?? []);
      group.forEach((kind) => byKind.delete(kind));

      if (groupResources.length > 0) {
        const results = await Promise.allSettled(
          groupResources.map(async (resource) => ResourceCleaner.deleteResource(resource)),
        );
        processResults(results);
      }
    }

    // Catch-all for any kind not covered by the groups above (future-proofing)
    const remainingResources = [...byKind.values()].flat();
    if (remainingResources.length > 0) {
      const results = await Promise.allSettled(
        remainingResources.map(async (resource) => ResourceCleaner.deleteResource(resource)),
      );
      processResults(results);
    }

    if (failureCount > 0) {
      console.log(
        `Cleanup: ${deletedCount} deleted, ${skippedCount} skipped, ${failureCount} failed`,
      );
    }
  }

  private static async deleteResource(
    resource: SupportedResource,
  ): Promise<{ success: boolean; skipped: boolean; reason?: string }> {
    const resourceName = resource.metadata?.name;
    const namespace = resource.metadata?.namespace ?? MTV_NAMESPACE;

    if (!resourceName) {
      throw new Error('Resource missing required metadata (name)');
    }

    const resourceType = ResourceCleaner.getResourceType(resource);

    const buildApiPath = (): string => {
      if (resourceType === RESOURCE_TYPES.VIRTUAL_MACHINES) {
        return `${API_PATHS.KUBEVIRT}/namespaces/${namespace}/${resourceType}/${resourceName}`;
      }
      if (resourceType === RESOURCE_TYPES.PROJECTS) {
        return `${API_PATHS.OPENSHIFT_PROJECT}/${resourceType}/${resourceName}`;
      }
      if (resourceType === RESOURCE_TYPES.NAMESPACES) {
        return `${API_PATHS.KUBERNETES_CORE}/${resourceType}/${resourceName}`;
      }
      if (resourceType === RESOURCE_TYPES.SECRETS) {
        return `${API_PATHS.KUBERNETES_CORE}/namespaces/${namespace}/${resourceType}/${resourceName}`;
      }
      return `${API_PATHS.FORKLIFT}/namespaces/${namespace}/${resourceType}/${resourceName}`;
    };

    const apiPath = buildApiPath();

    try {
      await ResourceCleaner.apiDelete(apiPath);
      return { success: true, skipped: false };
    } catch (error) {
      const errorStr = String(error);

      if (errorStr.includes('404') || errorStr.includes('not found')) {
        return { success: true, skipped: true, reason: 'not found' };
      }

      if (errorStr.includes('403') || errorStr.includes('Forbidden')) {
        return { success: true, skipped: true, reason: 'deletion forbidden' };
      }

      throw error;
    }
  }

  private static getResourceType(resource: SupportedResource): string {
    if (resource.kind) {
      return ResourceCleaner.getResourceTypeFromKind(resource.kind);
    }
    return 'unknown';
  }

  static loadResourcesFromFile(): SupportedResource[] {
    if (existsSync(RESOURCES_FILE)) {
      const data = readFileSync(RESOURCES_FILE, 'utf-8');
      return JSON.parse(data) as SupportedResource[];
    }
    return [];
  }

  static saveResourcesToFile(resources: SupportedResource[]): void {
    writeFileSync(RESOURCES_FILE, JSON.stringify(resources, null, 2));
  }
}
