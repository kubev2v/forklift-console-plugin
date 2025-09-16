import type { V1beta1Provider, V1VirtualMachine } from '@kubev2v/types';
import type { Page } from '@playwright/test';

import {
  API_PATHS,
  COOKIE_NAMES,
  DEFAULT_NAMESPACE,
  HTTP_HEADERS,
  RESOURCE_KINDS,
  RESOURCE_TYPES,
} from './constants';
import type { SupportedResource } from './ResourceManager';

/**
 * Handles fetching resources from Kubernetes APIs
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourceFetcher {
  static async fetchProvider(
    page: Page,
    providerName: string,
    namespace = DEFAULT_NAMESPACE,
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

    try {
      const result = await page.evaluate(
        async ({ resType, resourceKind, name, ns, constants }) => {
          try {
            const getCsrfTokenFromCookie = () => {
              const cookies = document.cookie.split('; ');
              const csrfCookie = cookies.find((cookie) =>
                cookie.startsWith(`${constants.CSRF_TOKEN_NAME}=`),
              );
              return csrfCookie ? csrfCookie.split('=')[1] : '';
            };
            const csrfToken = getCsrfTokenFromCookie();

            let apiPath = '';
            if (resType === constants.VIRTUAL_MACHINES_TYPE) {
              apiPath = `${constants.KUBEVIRT_PATH}/namespaces/${ns}/${resType}/${name}`;
            } else {
              apiPath = `${constants.FORKLIFT_PATH}/namespaces/${ns}/${resType}/${name}`;
            }

            const response = await fetch(apiPath, {
              method: 'GET',
              headers: {
                [constants.CONTENT_TYPE_HEADER]: constants.APPLICATION_JSON,
                [constants.CSRF_TOKEN_HEADER]: csrfToken,
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
          constants: {
            CSRF_TOKEN_NAME: COOKIE_NAMES.CSRF_TOKEN,
            VIRTUAL_MACHINES_TYPE: RESOURCE_TYPES.VIRTUAL_MACHINES,
            KUBEVIRT_PATH: API_PATHS.KUBEVIRT,
            FORKLIFT_PATH: API_PATHS.FORKLIFT,
            CONTENT_TYPE_HEADER: HTTP_HEADERS.CONTENT_TYPE,
            APPLICATION_JSON: HTTP_HEADERS.APPLICATION_JSON,
            CSRF_TOKEN_HEADER: HTTP_HEADERS.CSRF_TOKEN,
          },
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
}
