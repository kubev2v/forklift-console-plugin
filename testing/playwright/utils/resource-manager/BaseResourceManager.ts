import { testError, testWarn } from '../testLog';

import { apiRequest } from './apiRequest';
import { getResourceTypeFromKind } from './resourceType';

const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;

/**
 * Base class providing shared Node.js HTTP functionality for resource managers.
 *
 * Auth mode is resolved at call time:
 *  - **Kubeconfig mode** (preferred): uses the kubeconfig written by globalSetup after
 *    `oc login`. Talks directly to the cluster API server with a long-lived Bearer token.
 *    Session expiry only affects UI test steps, not resource operations.
 *  - **Cookie fallback**: when no kubeconfig is available, falls back to the OpenShift
 *    console proxy (/api/kubernetes/...) using the session cookies saved in AUTH_FILE.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class BaseResourceManager {
  /** Exposed for subclasses that need status-code dispatch (e.g. ResourceCleaner). */
  protected static apiRequest = apiRequest;

  /**
   * Convenience wrapper for DELETE requests.
   * `ResourceCleaner.deleteResource` calls `apiRequest` directly to inspect
   * the raw status code (404 → skip, 403 → skip, other → throw). This method
   * is kept as a public extension point for callers that only need a
   * success/null response and do not need status-code dispatch.
   */
  static async apiDelete<R>(apiPath: string): Promise<R | null> {
    const result = await apiRequest<R>(apiPath, { method: 'DELETE' });

    if (result.success) {
      return result.data;
    }

    if (result.status === HTTP_NOT_FOUND) {
      return null;
    }

    testError(`API DELETE ${apiPath} failed: ${result.error}`);
    return null;
  }

  static async apiGet<R>(apiPath: string): Promise<R | null> {
    const result = await apiRequest<R>(apiPath, { method: 'GET' });

    if (result.success) {
      return result.data;
    }

    testError(`API GET ${apiPath} failed: ${result.error}`);
    return null;
  }

  static async apiPatch<R>(
    apiPath: string,
    data: unknown,
    contentType = 'application/merge-patch+json',
  ): Promise<R | null> {
    const result = await apiRequest<R>(apiPath, {
      body: data,
      contentType,
      method: 'PATCH',
    });

    if (result.success) {
      return result.data;
    }

    testError(`API PATCH ${apiPath} failed: ${result.error}`);
    return null;
  }

  static async apiPost<R>(apiPath: string, data: unknown): Promise<R | null> {
    const result = await apiRequest<R>(apiPath, {
      body: data,
      method: 'POST',
    });

    if (result.success) {
      return result.data;
    }

    if (result.status === HTTP_CONFLICT) {
      testWarn(`API POST to ${apiPath}: resource already exists (409)`);
    } else {
      testError(`API POST to ${apiPath} failed: ${result.error}`);
    }

    return null;
  }

  static getResourceTypeFromKind(kind: string): string {
    return getResourceTypeFromKind(kind);
  }
}
