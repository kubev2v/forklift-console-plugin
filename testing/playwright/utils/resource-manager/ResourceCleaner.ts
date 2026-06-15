import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { isEmpty } from '../utils';

import { BaseResourceManager } from './BaseResourceManager';
import { API_PATHS, MTV_NAMESPACE, RESOURCE_TYPES, RESOURCES_FILE } from './constants';
import type { SupportedResource } from './ResourceManager';

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

    const cleanupPromises = resources.map(async (resource) =>
      ResourceCleaner.deleteResource(resource),
    );

    const results = await Promise.allSettled(cleanupPromises);

    let deletedCount = 0;
    let skippedCount = 0;
    let failureCount = 0;

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { skipped } = result.value;
        if (skipped) {
          skippedCount += 1;
        } else {
          deletedCount += 1;
        }
      } else {
        failureCount += 1;
      }
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
