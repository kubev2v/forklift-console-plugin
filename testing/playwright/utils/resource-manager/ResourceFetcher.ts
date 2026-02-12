import type {
  V1beta1ForkliftController,
  V1beta1Plan,
  V1beta1Provider,
  V1VirtualMachine,
} from '@forklift-ui/types';
import type { Page } from '@playwright/test';

import { BaseResourceManager } from './BaseResourceManager';
import { API_PATHS, MTV_NAMESPACE, OPERATOR_CSV_PREFIXES, RESOURCE_KINDS } from './constants';
import type { SupportedResource } from './ResourceManager';

/**
 * Handles fetching resources from Kubernetes APIs
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourceFetcher extends BaseResourceManager {
  static async fetchForkliftController(
    page: Page,
    controllerName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1ForkliftController | null> {
    return ResourceFetcher.fetchResource<V1beta1ForkliftController>(page, {
      kind: RESOURCE_KINDS.FORKLIFT_CONTROLLER,
      resourceName: controllerName,
      namespace,
    });
  }

  /**
   * Fetches the MTV/Forklift operator version from the cluster by reading the
   * ClusterServiceVersion (CSV) resource created by OLM.
   *
   * Looks for a CSV whose name starts with "mtv-operator" (downstream) or
   * "forklift-operator" (upstream) and returns its spec.version.
   *
   * @returns The semver version string (e.g. "2.7.0") or null if not found.
   */
  static async fetchMtvVersion(page: Page, namespace = MTV_NAMESPACE): Promise<string | null> {
    const apiPath = `${API_PATHS.OLM_CSV}/namespaces/${namespace}/clusterserviceversions`;
    const constants = ResourceFetcher.getEvaluateConstants();

    try {
      const result = await page.evaluate(
        async ({ path, prefixes, evalConstants }) => {
          try {
            const cookies = document.cookie.split('; ');
            const csrfCookie = cookies.find((cookie) =>
              cookie.startsWith(`${evalConstants.CSRF_TOKEN_NAME}=`),
            );
            const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';

            const response = await fetch(path, {
              credentials: 'include',
              headers: {
                [evalConstants.CONTENT_TYPE_HEADER]: evalConstants.APPLICATION_JSON,
                [evalConstants.CSRF_TOKEN_HEADER]: csrfToken,
              },
              method: 'GET',
            });

            if (!response.ok) {
              return { error: `HTTP ${String(response.status)}`, success: false as const };
            }

            const data = await response.json();
            const items: { metadata?: { name?: string }; spec?: { version?: string } }[] =
              data.items ?? [];

            const operatorCsv = items.find((csv) =>
              prefixes.some((prefix: string) => csv.metadata?.name?.startsWith(prefix)),
            );

            if (!operatorCsv?.spec?.version) {
              return { error: 'Operator CSV not found', success: false as const };
            }

            return { success: true as const, version: operatorCsv.spec.version };
          } catch (error: unknown) {
            const err = error as Error;
            return { error: err?.message ?? String(error), success: false as const };
          }
        },
        { evalConstants: constants, path: apiPath, prefixes: [...OPERATOR_CSV_PREFIXES] },
      );

      if (result.success) {
        return result.version;
      }

      console.error(`Failed to fetch MTV version: ${result.error}`);
      return null;
    } catch {
      return null;
    }
  }

  static async fetchPlan(
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

  static async fetchProvider(
    page: Page,
    providerName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> {
    return ResourceFetcher.fetchResource<V1beta1Provider>(page, {
      kind: RESOURCE_KINDS.PROVIDER,
      resourceName: providerName,
      namespace,
    });
  }

  static async fetchResource<T extends SupportedResource>(
    page: Page,
    options: { kind: string; resourceName: string; namespace: string },
  ): Promise<T | null> {
    const { kind, resourceName, namespace } = options;
    const resourceType = ResourceFetcher.getResourceTypeFromKind(kind);
    const constants = ResourceFetcher.getEvaluateConstants();

    try {
      const result = await page.evaluate(
        async ({ resType, resourceKind, name, ns, evalConstants }) => {
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
              apiPath = `${evalConstants.KUBEVIRT_PATH}/namespaces/${ns}/${resType}/${name}`;
            } else {
              apiPath = `${evalConstants.FORKLIFT_PATH}/namespaces/${ns}/${resType}/${name}`;
            }

            const response = await fetch(apiPath, {
              method: 'GET',
              headers: {
                [evalConstants.CONTENT_TYPE_HEADER]: evalConstants.APPLICATION_JSON,
                [evalConstants.CSRF_TOKEN_HEADER]: csrfToken,
              },
              credentials: 'include',
            });

            if (response.ok) {
              return { success: true, data: await response.json() };
            }

            if (response.status === 404) {
              return { success: false, error: `${resourceKind} not found` };
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
        {
          resType: resourceType,
          resourceKind: kind,
          name: resourceName,
          ns: namespace,
          evalConstants: constants,
        },
      );

      if (result.success) {
        return result.data as T;
      }

      return null;
    } catch {
      return null;
    }
  }

  static async fetchVirtualMachine(
    page: Page,
    vmName: string,
    namespace: string,
  ): Promise<V1VirtualMachine | null> {
    return ResourceFetcher.fetchResource<V1VirtualMachine>(page, {
      kind: RESOURCE_KINDS.VIRTUAL_MACHINE,
      resourceName: vmName,
      namespace,
    });
  }
}
