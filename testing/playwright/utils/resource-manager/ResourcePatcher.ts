import type { V1beta1ForkliftController, V1beta1Provider } from '@forklift-ui/types';
import type { Page } from '@playwright/test';

import { BaseResourceManager } from './BaseResourceManager';
import { MTV_NAMESPACE, RESOURCE_KINDS } from './constants';
import type { SupportedResource } from './ResourceManager';

/**
 * JSON Patch operation for RFC 6902.
 * Export for use by consumers who need to build patch operations.
 */
export interface JsonPatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: unknown;
  from?: string;
}

/**
 * Patch type determines the Content-Type header and body format.
 * - 'merge': Uses application/merge-patch+json (RFC 7396) - for simple field updates
 * - 'json': Uses application/json-patch+json (RFC 6902) - for array operations
 */
export type PatchType = 'merge' | 'json';

/**
 * Handles patching resources in Kubernetes APIs
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourcePatcher extends BaseResourceManager {
  static async patchForkliftController(
    page: Page,
    controllerName: string,
    patch: JsonPatchOperation[],
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1ForkliftController | null> {
    return ResourcePatcher.patchResource<V1beta1ForkliftController>(page, {
      kind: RESOURCE_KINDS.FORKLIFT_CONTROLLER,
      resourceName: controllerName,
      namespace,
      patch,
      patchType: 'json',
    });
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

  /**
   * Patches a Kubernetes resource using either merge patch or JSON patch.
   * @param page - Playwright page
   * @param options.kind - Resource kind (e.g., 'Plan', 'Provider')
   * @param options.resourceName - Name of the resource
   * @param options.namespace - Namespace of the resource
   * @param options.patch - Patch data (object for merge, array of operations for json)
   * @param options.patchType - 'merge' (default) or 'json' for array operations
   */
  static async patchResource<T extends SupportedResource>(
    page: Page,
    options: {
      kind: string;
      resourceName: string;
      namespace: string;
      patch: Record<string, any> | JsonPatchOperation[];
      patchType?: PatchType;
    },
  ): Promise<T | null> {
    const { kind, resourceName, namespace, patch, patchType = 'merge' } = options;
    const resourceType = ResourcePatcher.getResourceTypeFromKind(kind);
    const constants = ResourcePatcher.getEvaluateConstants();
    const contentType =
      patchType === 'json' ? 'application/json-patch+json' : 'application/merge-patch+json';

    try {
      const result = await page.evaluate(
        async ({ resType, resourceKind, name, ns, patchData, patchContentType, evalConstants }) => {
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
                [evalConstants.CONTENT_TYPE_HEADER]: patchContentType,
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
          patchContentType: contentType,
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
