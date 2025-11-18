import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import type { BrowserContextOptions, Page } from '@playwright/test';

import { isEmpty } from '../utils';

import { BaseResourceManager } from './BaseResourceManager';
import { MTV_NAMESPACE, RESOURCES_FILE } from './constants';
import type { SupportedResource } from './ResourceManager';

/**
 * Handles cleanup and deletion of Kubernetes resources
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourceCleaner extends BaseResourceManager {
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
    const namespace = resource.metadata?.namespace ?? MTV_NAMESPACE;

    if (!resourceName) {
      throw new Error('Resource missing required metadata (name)');
    }

    const resourceType = ResourceCleaner.getResourceType(resource);

    const constants = ResourceCleaner.getEvaluateConstants();

    try {
      const result = await page.evaluate(
        async ({ resType, resName, resNamespace, evalConstants }) => {
          try {
            const getCsrfTokenFromCookie = () => {
              const cookies = document.cookie.split('; ');
              const csrfCookie = cookies.find((cookie) =>
                cookie.startsWith(`${evalConstants.CSRF_TOKEN_NAME}=`),
              );
              return csrfCookie ? csrfCookie.split('=')[1] : '';
            };
            const csrfToken = getCsrfTokenFromCookie();

            let apiPath = '';
            if (resType === evalConstants.VIRTUAL_MACHINES_TYPE) {
              apiPath = `${evalConstants.KUBEVIRT_PATH}/namespaces/${resNamespace}/${resType}/${resName}`;
            } else if (resType === evalConstants.PROJECTS_TYPE) {
              apiPath = `${evalConstants.OPENSHIFT_PROJECT_PATH}/${resType}/${resName}`;
            } else if (resType === evalConstants.NAMESPACES_TYPE) {
              apiPath = `${evalConstants.KUBERNETES_CORE}/${resType}/${resName}`;
            } else {
              apiPath = `${evalConstants.FORKLIFT_PATH}/namespaces/${resNamespace}/${resType}/${resName}`;
            }

            const response = await fetch(apiPath, {
              method: 'DELETE',
              headers: {
                [evalConstants.CONTENT_TYPE_HEADER]: evalConstants.APPLICATION_JSON,
                [evalConstants.CSRF_TOKEN_HEADER]: csrfToken,
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
          evalConstants: constants,
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
