import type { Page } from '@playwright/test';

import { API_PATHS, COOKIE_NAMES, HTTP_HEADERS, RESOURCE_KINDS, RESOURCE_TYPES } from './constants';

type ApiResult<T> =
  | { data: T; status: number; success: true }
  | { error: string; status: number; success: false };

type ApiRequestOptions = {
  body?: unknown;
  contentType?: string;
  method: string;
};

/**
 * Base class providing shared functionality for resource manager classes
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class BaseResourceManager {
  /** Generic GET helper — handles CSRF token, headers, and error handling. */
  public static async apiGet<R>(page: Page, apiPath: string): Promise<R | null> {
    const result = await BaseResourceManager.apiRequest<R>(page, apiPath, { method: 'GET' });

    if (result.success) return result.data;

    console.error(`API GET ${apiPath} failed: ${result.error}`);
    return null;
  }

  /** Generic PATCH helper — handles CSRF token, headers, and error handling. */
  public static async apiPatch<R>(
    page: Page,
    apiPath: string,
    data: unknown,
    contentType = 'application/merge-patch+json',
  ): Promise<R | null> {
    const result = await BaseResourceManager.apiRequest<R>(page, apiPath, {
      body: data,
      contentType,
      method: 'PATCH',
    });

    if (result.success) return result.data;

    console.error(`API PATCH ${apiPath} failed: ${result.error}`);
    return null;
  }

  /** Generic POST helper — handles CSRF token, headers, and error handling. */
  public static async apiPost<R>(page: Page, apiPath: string, data: unknown): Promise<R | null> {
    const result = await BaseResourceManager.apiRequest<R>(page, apiPath, {
      body: data,
      method: 'POST',
    });

    if (result.success) return result.data;

    const HTTP_CONFLICT = 409;

    if (result.status === HTTP_CONFLICT) {
      console.warn(`API POST to ${apiPath}: resource already exists (409)`);
    } else {
      console.error(`API POST to ${apiPath} failed: ${result.error}`);
    }

    return null;
  }

  private static async apiRequest<R>(
    page: Page,
    apiPath: string,
    options: ApiRequestOptions,
  ): Promise<ApiResult<R>> {
    const constants = BaseResourceManager.getEvaluateConstants();

    return page.evaluate(
      async ({ body, contentType, evalConstants, method, path }): Promise<ApiResult<R>> => {
        try {
          const cookies = document.cookie.split('; ');
          const csrfCookie = cookies.find((cookie) =>
            cookie.startsWith(`${evalConstants.CSRF_TOKEN_NAME}=`),
          );
          const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';

          const response = await fetch(path, {
            ...(body !== undefined && { body: JSON.stringify(body) }),
            credentials: 'include',
            headers: {
              [evalConstants.CONTENT_TYPE_HEADER]: contentType ?? evalConstants.APPLICATION_JSON,
              [evalConstants.CSRF_TOKEN_HEADER]: csrfToken,
            },
            method,
          });

          if (response.ok) {
            return { data: await response.json(), status: response.status, success: true };
          }

          const errorText = await response.text().catch(() => response.statusText);
          return { error: errorText, status: response.status, success: false };
        } catch (error: unknown) {
          const err = error as Error;
          return { error: err?.message ?? String(error), status: 0, success: false };
        }
      },
      {
        body: options.body,
        contentType: options.contentType,
        evalConstants: constants,
        method: options.method,
        path: apiPath,
      },
    );
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
      SECRETS_TYPE: RESOURCE_TYPES.SECRETS,
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
      [RESOURCE_KINDS.SECRET]: RESOURCE_TYPES.SECRETS,
      [RESOURCE_KINDS.STORAGE_MAP]: RESOURCE_TYPES.STORAGE_MAPS,
      [RESOURCE_KINDS.VIRTUAL_MACHINE]: RESOURCE_TYPES.VIRTUAL_MACHINES,
      [RESOURCE_KINDS.PROJECT]: RESOURCE_TYPES.PROJECTS,
      [RESOURCE_KINDS.NAMESPACE]: RESOURCE_TYPES.NAMESPACES,
    };

    return kindToType[kind] ?? `${kind.toLowerCase()}s`;
  }
}
