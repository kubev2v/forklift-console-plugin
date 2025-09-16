import { existsSync, readFileSync, writeFileSync } from 'fs';

import type { BrowserContextOptions, Page } from '@playwright/test';

import { isEmpty } from '../utils';

import { DEFAULT_NAMESPACE, RESOURCE_KINDS, RESOURCE_TYPES, RESOURCES_FILE } from './constants';
import type { SupportedResource } from './ResourceManager';

/**
 * Handles cleanup and deletion of Kubernetes resources
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourceCleaner {
  static async cleanupAll(page: Page, resources: SupportedResource[]): Promise<void> {
    if (isEmpty(resources)) {
      console.log('No resources to cleanup');
      return;
    }

    const cleanupPromises = resources.map(async (resource) =>
      ResourceCleaner.deleteResource(page, resource),
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
    page: Page,
    resource: SupportedResource,
  ): Promise<{ success: boolean; skipped: boolean; reason?: string }> {
    const resourceName = resource.metadata?.name;
    const namespace = resource.metadata?.namespace ?? DEFAULT_NAMESPACE;

    if (!resourceName) {
      throw new Error('Resource missing required metadata (name)');
    }

    const resourceType = ResourceCleaner.getResourceType(resource);

    try {
      const result = await page.evaluate(
        async ({ resType, resName, resNamespace }) => {
          try {
            // Get CSRF token from cookie
            const getCsrfTokenFromCookie = () => {
              const cookies = document.cookie.split('; ');
              const csrfCookie = cookies.find((cookie) => cookie.startsWith('csrf-token='));
              return csrfCookie ? csrfCookie.split('=')[1] : '';
            };
            const csrfToken = getCsrfTokenFromCookie();

            let apiPath = '';
            if (resType === 'virtualmachines') {
              apiPath = `/api/kubernetes/apis/kubevirt.io/v1/namespaces/${resNamespace}/${resType}/${resName}`;
            } else if (resType === 'projects') {
              apiPath = `/api/kubernetes/apis/project.openshift.io/v1/${resType}/${resName}`;
            } else if (resType === 'namespaces') {
              apiPath = `/api/kubernetes/api/v1/${resType}/${resName}`;
            } else {
              apiPath = `/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/${resNamespace}/${resType}/${resName}`;
            }

            const response = await fetch(apiPath, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
              },
              credentials: 'include',
            });

            if (response.ok || response.status === 404) {
              return { success: true, error: null, wasNotFound: response.status === 404 };
            }

            const errorText = await response.text().catch(() => response.statusText);

            return {
              success: false,
              error: {
                message: errorText,
                status: response.status,
              },
            };
          } catch (error: unknown) {
            const err = error as any;
            return {
              success: false,
              error: {
                message: err?.message ?? String(error),
                status: err?.status ?? 'unknown',
              },
            };
          }
        },
        {
          resType: resourceType,
          resName: resourceName,
          resNamespace: namespace,
        },
      );

      if (!result.success) {
        const { error } = result;

        if (!error) {
          throw new Error('Failed to delete: unknown error');
        }

        if (error.status === 404 || error.message.includes('not found')) {
          return { success: true, skipped: true, reason: 'not found' };
        }

        if (error.status === 403 || error.message.includes('Forbidden')) {
          return {
            success: true,
            skipped: true,
            reason: 'deletion forbidden',
          };
        }

        throw new Error(`Failed to delete: ${error.message}`);
      }

      if (result.wasNotFound) {
        return { success: true, skipped: true, reason: 'not found' };
      }

      return { success: true, skipped: false };
    } catch (error) {
      const errorStr = String(error);

      if (errorStr.includes('404') || errorStr.includes('not found')) {
        return { success: true, skipped: true, reason: 'not found' };
      }

      if (errorStr.includes('403') || errorStr.includes('Forbidden')) {
        return {
          success: true,
          skipped: true,
          reason: 'deletion forbidden',
        };
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

  private static getResourceTypeFromKind(kind: string): string {
    switch (kind) {
      case RESOURCE_KINDS.MIGRATION:
        return RESOURCE_TYPES.MIGRATIONS;
      case RESOURCE_KINDS.PLAN:
        return RESOURCE_TYPES.PLANS;
      case RESOURCE_KINDS.PROVIDER:
        return RESOURCE_TYPES.PROVIDERS;
      case RESOURCE_KINDS.VIRTUAL_MACHINE:
        return RESOURCE_TYPES.VIRTUAL_MACHINES;
      case RESOURCE_KINDS.PROJECT:
        return RESOURCE_TYPES.PROJECTS;
      case RESOURCE_KINDS.NAMESPACE:
        return RESOURCE_TYPES.NAMESPACES;
      default:
        return `${kind.toLowerCase()}s`;
    }
  }

  static async instantCleanup(
    resources: SupportedResource[],
    baseUrl = process.env.BRIDGE_BASE_ADDRESS ??
      process.env.BASE_ADDRESS ??
      'http://localhost:9000',
    storageStatePath?: string,
  ): Promise<void> {
    if (isEmpty(resources)) {
      return;
    }

    const { chromium } = await import('@playwright/test');
    const browser = await chromium.launch({ headless: true });

    const contextOptions: BrowserContextOptions = {
      ignoreHTTPSErrors: true,
    };

    const defaultAuthPath = 'playwright/.auth/user.json';
    if (storageStatePath) {
      contextOptions.storageState = storageStatePath;
    } else if (existsSync(defaultAuthPath)) {
      contextOptions.storageState = defaultAuthPath;
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    try {
      await page.goto(`${baseUrl}/k8s/all-namespaces/forklift.konveyor.io~v1beta1~Provider`);
      await page.waitForLoadState('networkidle');
      await ResourceCleaner.cleanupAll(page, resources);
    } catch (error) {
      console.error('Error during instant cleanup:', error);
      throw error;
    } finally {
      await context.close();
      await browser.close();
    }
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
