import type { V1beta1Provider } from '@kubev2v/types';
import type { Page } from '@playwright/test';

import { BaseResourceManager } from './BaseResourceManager';
import { MTV_NAMESPACE, RESOURCE_KINDS } from './constants';
import type { SupportedResource } from './ResourceManager';

/**
 * Handles patching resources in Kubernetes APIs
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourcePatcher extends BaseResourceManager {
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
    const constants = ResourcePatcher.getEvaluateConstants();

    try {
      const result = await page.evaluate(
        async ({ resType, resourceKind, name, ns, patchData, evalConstants }) => {
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
              method: 'PATCH',
              headers: {
                [evalConstants.CONTENT_TYPE_HEADER]: 'application/merge-patch+json',
                [evalConstants.CSRF_TOKEN_HEADER]: csrfToken,
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
          evalConstants: constants,
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
