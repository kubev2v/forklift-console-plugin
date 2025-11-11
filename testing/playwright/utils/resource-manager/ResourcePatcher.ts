import type { V1beta1Provider } from '@kubev2v/types';
import type { Page } from '@playwright/test';

import {
  API_PATHS,
  COOKIE_NAMES,
  HTTP_HEADERS,
  MTV_NAMESPACE,
  RESOURCE_KINDS,
  RESOURCE_TYPES,
} from './constants';
import type { SupportedResource } from './ResourceManager';

/**
 * Handles patching resources in Kubernetes APIs
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourcePatcher {
  private static getResourceTypeFromKind(kind: string): string {
    const kindToType: Record<string, string> = {
      [RESOURCE_KINDS.MIGRATION]: RESOURCE_TYPES.MIGRATIONS,
      [RESOURCE_KINDS.NETWORK_MAP]: RESOURCE_TYPES.NETWORK_MAPS,
      [RESOURCE_KINDS.PLAN]: RESOURCE_TYPES.PLANS,
      [RESOURCE_KINDS.PROVIDER]: RESOURCE_TYPES.PROVIDERS,
      [RESOURCE_KINDS.VIRTUAL_MACHINE]: RESOURCE_TYPES.VIRTUAL_MACHINES,
      [RESOURCE_KINDS.PROJECT]: RESOURCE_TYPES.PROJECTS,
      [RESOURCE_KINDS.NAMESPACE]: RESOURCE_TYPES.NAMESPACES,
    };

    const resourceType = kindToType[kind];
    if (!resourceType) {
      throw new Error(`Unknown resource kind: ${kind}`);
    }

    return resourceType;
  }

  static async patchProvider(
    page: Page,
    providerName: string,
    patch: Record<string, any>,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> {
    return ResourcePatcher.patchResource<V1beta1Provider>(page, {
      kind: RESOURCE_KINDS.PROVIDER,
      resourceName: providerName,
      namespace,
      patch,
    });
  }

  static async patchResource<T extends SupportedResource>(
    page: Page,
    options: {
      kind: string;
      resourceName: string;
      namespace: string;
      patch: Record<string, any>;
    },
  ): Promise<T | null> {
    const { kind, resourceName, namespace, patch } = options;
    const resourceType = ResourcePatcher.getResourceTypeFromKind(kind);

    try {
      const result = await page.evaluate(
        async ({ resType, resourceKind, name, ns, patchData, constants }) => {
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
              method: 'PATCH',
              headers: {
                [constants.CONTENT_TYPE_HEADER]: 'application/merge-patch+json',
                [constants.CSRF_TOKEN_HEADER]: csrfToken,
              },
              credentials: 'include',
              body: JSON.stringify(patchData),
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
            const err = error as Error;
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
          patchData: patch,
          constants: {
            CSRF_TOKEN_NAME: COOKIE_NAMES.CSRF_TOKEN,
            CONTENT_TYPE_HEADER: HTTP_HEADERS.CONTENT_TYPE,
            APPLICATION_JSON: HTTP_HEADERS.APPLICATION_JSON,
            CSRF_TOKEN_HEADER: HTTP_HEADERS.CSRF_TOKEN,
            KUBEVIRT_PATH: API_PATHS.KUBEVIRT,
            FORKLIFT_PATH: API_PATHS.FORKLIFT,
            VIRTUAL_MACHINES_TYPE: RESOURCE_TYPES.VIRTUAL_MACHINES,
          },
        },
      );

      if (result.success && result.data) {
        return result.data as T;
      }

      console.error(`Failed to patch ${kind} ${resourceName}: ${result.error}`);
      return null;
    } catch (error) {
      console.error(`Exception while patching ${kind} ${resourceName}:`, error);
      return null;
    }
  }
}
