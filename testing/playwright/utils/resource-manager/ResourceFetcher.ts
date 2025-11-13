import type { V1beta1Provider, V1VirtualMachine } from '@kubev2v/types';
import type { Page } from '@playwright/test';

import { BaseResourceManager } from './BaseResourceManager';
import { MTV_NAMESPACE, RESOURCE_KINDS } from './constants';
import type { SupportedResource } from './ResourceManager';

/**
 * Handles fetching resources from Kubernetes APIs
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourceFetcher extends BaseResourceManager {
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
