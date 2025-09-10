import { existsSync, readFileSync, writeFileSync } from 'fs';

import type {
  IoK8sApiCoreV1Namespace,
  V1beta1Migration,
  V1beta1Plan,
  V1beta1Provider,
  V1VirtualMachine,
} from '@kubev2v/types';
import type { BrowserContextOptions, Page } from '@playwright/test';

import { isEmpty } from '../../../src/utils/helpers';

const RESOURCES_FILE = 'playwright/.resources.json';

// OpenShift Project interface (extends Kubernetes Namespace)
export interface OpenshiftProject extends IoK8sApiCoreV1Namespace {
  kind: 'Project';
  apiVersion: 'project.openshift.io/v1';
}

export type SupportedResource =
  | V1beta1Migration
  | V1beta1Plan
  | V1beta1Provider
  | V1VirtualMachine
  | IoK8sApiCoreV1Namespace
  | OpenshiftProject;

export class ResourceManager {
  private resources: SupportedResource[] = [];

  private async cleanupResource(
    page: Page,
    resource: SupportedResource,
  ): Promise<{ success: boolean; skipped: boolean; reason?: string }> {
    const resourceName = resource.metadata?.name;
    const namespace = resource.metadata?.namespace ?? 'openshift-mtv';

    if (!resourceName) {
      throw new Error('Resource missing required metadata (name)');
    }

    const resourceType = this.getResourceType(resource);

    try {
      // Use direct Kubernetes API call since Console SDK isn't available in Playwright context
      const result = await page.evaluate(
        async ({ resType, resName, resNamespace }) => {
          try {
            // Get CSRF token from cookie
            const getCsrfTokenFromCookie = () => {
              const csrfRegex = /csrf-token=(?<token>[^;]+)/;
              const match = csrfRegex.exec(document.cookie);
              return match?.groups?.token ?? '';
            };

            const csrfToken = getCsrfTokenFromCookie();

            // Build API URL using resource type variable
            let apiPath = '';
            if (resType === 'virtualmachines') {
              // VirtualMachines use kubevirt.io API
              apiPath = `/api/kubernetes/apis/kubevirt.io/v1/namespaces/${resNamespace}/${resType}/${resName}`;
            } else if (resType === 'projects') {
              // OpenShift Projects use project.openshift.io API
              apiPath = `/api/kubernetes/apis/project.openshift.io/v1/${resType}/${resName}`;
            } else if (resType === 'namespaces') {
              // Kubernetes Namespaces use core API
              apiPath = `/api/kubernetes/api/v1/${resType}/${resName}`;
            } else {
              // Other resources use forklift.konveyor.io API
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
        { resType: resourceType, resName: resourceName, resNamespace: namespace },
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

      // Handle 404 and 403 errors gracefully
      if (errorStr.includes('404') || errorStr.includes('not found')) {
        return { success: true, skipped: true, reason: 'not found' };
      }

      if (errorStr.includes('403') || errorStr.includes('Forbidden')) {
        return {
          success: true,
          skipped: true,
          reason: 'deletion forbidden (expected in test context)',
        };
      }

      throw error;
    }
  }

  /**
   * Determine resource type from typed resource
   */
  private getResourceType(resource: SupportedResource): string {
    // First try using the Kubernetes kind field (most reliable)
    if (resource.kind) {
      switch (resource.kind) {
        case 'Migration':
          return 'migrations';
        case 'Plan':
          return 'plans';
        case 'Provider':
          return 'providers';
        case 'VirtualMachine':
          return 'virtualmachines';
        case 'Project':
          return 'projects';
        case 'Namespace':
          return 'namespaces';
        default:
          // Fall through to spec-based detection
          break;
      }
    }

    // Fallback: Check for Migration resource
    if ('spec' in resource && resource.spec && 'plan' in resource.spec) {
      return 'migrations';
    }

    // Check for Plan resource
    if ('spec' in resource && resource.spec && 'provider' in resource.spec) {
      return 'plans';
    }

    // Check for Provider resource (providers have different spec structure)
    if (
      'spec' in resource &&
      resource.spec &&
      ('url' in resource.spec || 'type' in resource.spec)
    ) {
      return 'providers';
    }

    // Default fallback
    return 'unknown';
  }

  /**
   * Add a project for cleanup tracking
   */
  addProject(projectName: string, isOpenShift = true): void {
    const project: OpenshiftProject | IoK8sApiCoreV1Namespace = isOpenShift
      ? ({
          kind: 'Project',
          apiVersion: 'project.openshift.io/v1',
          metadata: {
            name: projectName,
          },
        } as OpenshiftProject)
      : ({
          kind: 'Namespace',
          apiVersion: 'v1',
          metadata: {
            name: projectName,
          },
        } as IoK8sApiCoreV1Namespace);

    this.addResource(project);
  }

  /**
   * Add a typed resource for cleanup
   */
  addResource(resource: SupportedResource): void {
    this.resources.push(resource);
  }

  async cleanupAll(page: Page) {
    if (isEmpty(this.resources)) {
      console.log('No resources to cleanup');
      return;
    }

    const cleanupPromises = this.resources.map(async (resource) =>
      this.cleanupResource(page, resource),
    );

    // Run cleanup in parallel but handle errors gracefully
    const results = await Promise.allSettled(cleanupPromises);

    let deletedCount = 0;
    let skippedCount = 0;
    let failureCount = 0;

    for (const [index, result] of results.entries()) {
      const resource = this.resources[index];
      const resourceType = this.getResourceType(resource);
      const resourceName = resource.metadata?.name;

      if (result.status === 'fulfilled') {
        const { skipped } = result.value;

        if (skipped) {
          skippedCount += 1;
        } else {
          deletedCount += 1;
        }
      } else {
        failureCount += 1;

        console.warn(
          `⚠️ Failed to cleanup ${resourceType} ${resourceName}:`,
          String(result.reason).split('\\n')[0],
        );
      }
    }

    if (failureCount > 0) {
      console.log(
        `🧹 Cleanup: ${deletedCount} deleted, ${skippedCount} skipped, ${failureCount} failed`,
      );
    } else if (skippedCount > 0) {
      console.log(`🧹 Cleanup: ${deletedCount} deleted, ${skippedCount} skipped`);
    } else {
      console.log(`🧹 Cleanup: ${deletedCount} deleted`);
    }

    this.resources = [];
  }

  /**
   * Fetch a provider resource by name and namespace
   */
  async fetchProvider(
    page: Page,
    providerName: string,
    namespace = 'openshift-mtv',
  ): Promise<V1beta1Provider | null> {
    try {
      const result = await page.evaluate(
        async ({ name, ns }) => {
          try {
            // Get CSRF token from cookie
            const getCsrfTokenFromCookie = () => {
              const cookies = document.cookie.split('; ');
              const csrfCookie = cookies.find((cookie) => cookie.startsWith('csrf-token='));
              return csrfCookie ? csrfCookie.split('=')[1] : '';
            };

            const csrfToken = getCsrfTokenFromCookie();
            const apiPath = `/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/${ns}/providers/${name}`;

            const response = await fetch(apiPath, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
              },
              credentials: 'include',
            });

            if (response.ok) {
              return { success: true, data: await response.json() };
            }

            if (response.status === 404) {
              return { success: false, error: 'Provider not found' };
            }

            const errorText = await response.text().catch(() => response.statusText);
            return { success: false, error: errorText };
          } catch (error: unknown) {
            const err = error as any;
            return {
              success: false,
              error: err?.message ?? String(error),
            };
          }
        },
        { name: providerName, ns: namespace },
      );

      if (result.success) {
        return result.data as V1beta1Provider;
      }

      console.warn(`Failed to fetch provider ${providerName}:`, result.error);
      return null;
    } catch (error) {
      console.error(`Error fetching provider ${providerName}:`, error);
      return null;
    }
  }

  getResourceCount(): number {
    return this.resources.length;
  }

  /**
   * Instantly delete all resources by creating a browser context and cleaning up immediately.
   * This is useful for test afterAll blocks that want immediate cleanup.
   */
  async instantCleanup(
    baseUrl = process.env.BRIDGE_BASE_ADDRESS ??
      process.env.BASE_ADDRESS ??
      'http://localhost:9000',
    storageStatePath?: string,
  ): Promise<void> {
    if (this.getResourceCount() === 0) {
      return;
    }

    // Import Playwright dynamically to avoid issues in different contexts
    const { chromium } = await import('@playwright/test');
    const browser = await chromium.launch({ headless: true });

    const contextOptions: BrowserContextOptions = {
      ignoreHTTPSErrors: true,
    };

    // Add storage state if provided or if default auth file exists
    const defaultAuthPath = 'playwright/.auth/user.json';
    if (storageStatePath) {
      contextOptions.storageState = storageStatePath;
    } else if (existsSync(defaultAuthPath)) {
      contextOptions.storageState = defaultAuthPath;
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    try {
      // Navigate to the console for authenticated cleanup
      await page.goto(`${baseUrl}/k8s/all-namespaces/forklift.konveyor.io~v1beta1~Provider`);
      await page.waitForLoadState('networkidle');

      // Perform the cleanup
      await this.cleanupAll(page);
    } catch (error) {
      console.error('Error during instant cleanup:', error);
      throw error;
    } finally {
      await context.close();
      await browser.close();
    }
  }

  loadResourcesFromFile() {
    if (existsSync(RESOURCES_FILE)) {
      const data = readFileSync(RESOURCES_FILE, 'utf-8');
      this.resources = JSON.parse(data);
    }
  }

  /**
   * saves resources to a file for cleanup during global teardown.
   */
  saveForLaterCleanup(): void {
    writeFileSync(RESOURCES_FILE, JSON.stringify(this.resources, null, 2));
  }
}
