import type { V1beta1ForkliftController, V1beta1Provider } from '@forklift-ui/types';
import type { Page } from '@playwright/test';

import { BaseResourceManager } from './BaseResourceManager';
import { API_PATHS, MTV_NAMESPACE, RESOURCE_KINDS, RESOURCE_TYPES } from './constants';
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
   * Delegates to {@link BaseResourceManager.apiPatch} after building the path.
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
    const contentType =
      patchType === 'json' ? 'application/json-patch+json' : 'application/merge-patch+json';

    const basePath =
      resourceType === RESOURCE_TYPES.VIRTUAL_MACHINES ? API_PATHS.KUBEVIRT : API_PATHS.FORKLIFT;
    const apiPath = `${basePath}/namespaces/${namespace}/${resourceType}/${resourceName}`;

    return ResourcePatcher.apiPatch<T>(page, apiPath, patch, contentType);
  }
}
