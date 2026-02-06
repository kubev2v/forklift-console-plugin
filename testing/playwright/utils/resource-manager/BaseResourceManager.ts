import type { Page } from '@playwright/test';

import { API_PATHS, COOKIE_NAMES, HTTP_HEADERS, RESOURCE_KINDS, RESOURCE_TYPES } from './constants';

type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Base class providing shared functionality for resource manager classes
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class BaseResourceManager {
  /**
   * Generic API call helper that handles CSRF token and common error handling.
   * Reduces duplication across all resource creation functions.
   */
  public static async apiPost<R>(page: Page, apiPath: string, data: unknown): Promise<R | null> {
    const constants = BaseResourceManager.getEvaluateConstants();

    const result = await page.evaluate(
      async ({ payload, path, evalConstants }): Promise<ApiResult<R>> => {
        try {
          // Get CSRF token from cookies
          const cookies = document.cookie.split('; ');
          const csrfCookie = cookies.find((cookie) =>
            cookie.startsWith(`${evalConstants.CSRF_TOKEN_NAME}=`),
          );
          const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';

          const response = await fetch(path, {
            method: 'POST',
            headers: {
              [evalConstants.CONTENT_TYPE_HEADER]: evalConstants.APPLICATION_JSON,
              [evalConstants.CSRF_TOKEN_HEADER]: csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            return { success: true, data: await response.json() };
          }

          const errorText = await response.text().catch(() => response.statusText);
          return { success: false, error: errorText };
        } catch (error: unknown) {
          const err = error as Error;
          return { success: false, error: err?.message ?? String(error) };
        }
      },
      { payload: data, path: apiPath, evalConstants: constants },
    );

    if (result.success) {
      return result.data;
    }

    console.error(`API POST to ${apiPath} failed: ${result.error}`);
    return null;
  }

  public static getEvaluateConstants() {
    return {
      CSRF_TOKEN_NAME: COOKIE_NAMES.CSRF_TOKEN,
      CONTENT_TYPE_HEADER: HTTP_HEADERS.CONTENT_TYPE,
      APPLICATION_JSON: HTTP_HEADERS.APPLICATION_JSON,
      CSRF_TOKEN_HEADER: HTTP_HEADERS.CSRF_TOKEN,
      FORKLIFT_PATH: API_PATHS.FORKLIFT,
      KUBEVIRT_PATH: API_PATHS.KUBEVIRT,
      KUBERNETES_CORE: API_PATHS.KUBERNETES_CORE,
      OPENSHIFT_PROJECT_PATH: API_PATHS.OPENSHIFT_PROJECT,
      NAD_PATH: API_PATHS.NAD,
      VIRTUAL_MACHINES_TYPE: RESOURCE_TYPES.VIRTUAL_MACHINES,
      PROJECTS_TYPE: RESOURCE_TYPES.PROJECTS,
      NAMESPACES_TYPE: RESOURCE_TYPES.NAMESPACES,
    } as const;
  }

  public static getResourceTypeFromKind(kind: string): string {
    const kindToType: Record<string, string> = {
      [RESOURCE_KINDS.FORKLIFT_CONTROLLER]: RESOURCE_TYPES.FORKLIFT_CONTROLLERS,
      [RESOURCE_KINDS.MIGRATION]: RESOURCE_TYPES.MIGRATIONS,
      [RESOURCE_KINDS.NETWORK_MAP]: RESOURCE_TYPES.NETWORK_MAPS,
      [RESOURCE_KINDS.NETWORK_ATTACHMENT_DEFINITION]: RESOURCE_TYPES.NETWORK_ATTACHMENT_DEFINITIONS,
      [RESOURCE_KINDS.PLAN]: RESOURCE_TYPES.PLANS,
      [RESOURCE_KINDS.PROVIDER]: RESOURCE_TYPES.PROVIDERS,
      [RESOURCE_KINDS.STORAGE_MAP]: RESOURCE_TYPES.STORAGE_MAPS,
      [RESOURCE_KINDS.VIRTUAL_MACHINE]: RESOURCE_TYPES.VIRTUAL_MACHINES,
      [RESOURCE_KINDS.PROJECT]: RESOURCE_TYPES.PROJECTS,
      [RESOURCE_KINDS.NAMESPACE]: RESOURCE_TYPES.NAMESPACES,
    };

    return kindToType[kind] ?? `${kind.toLowerCase()}s`;
  }
}
