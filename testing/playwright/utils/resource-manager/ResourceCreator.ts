import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import type { Page } from '@playwright/test';

import { API_PATHS, COOKIE_NAMES, HTTP_HEADERS, MTV_NAMESPACE } from './constants';

/**
 * Handles creating resources in Kubernetes APIs
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourceCreator {
  static async createProvider(
    page: Page,
    provider: V1beta1Provider,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> {
    try {
      const result = await page.evaluate(
        async ({ providerData, ns, constants }) => {
          try {
            const getCsrfTokenFromCookie = () => {
              const cookies = document.cookie.split('; ');
              const csrfCookie = cookies.find((cookie) =>
                cookie.startsWith(`${constants.CSRF_TOKEN_NAME}=`),
              );
              return csrfCookie ? csrfCookie.split('=')[1] : '';
            };
            const csrfToken = getCsrfTokenFromCookie();

            const apiPath = `${constants.FORKLIFT_PATH}/namespaces/${ns}/providers`;

            const response = await fetch(apiPath, {
              method: 'POST',
              headers: {
                [constants.CONTENT_TYPE_HEADER]: constants.APPLICATION_JSON,
                [constants.CSRF_TOKEN_HEADER]: csrfToken,
              },
              credentials: 'include',
              body: JSON.stringify(providerData),
            });

            if (response.ok) {
              return { success: true, data: await response.json() };
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
          providerData: provider,
          ns: namespace,
          constants: {
            CSRF_TOKEN_NAME: COOKIE_NAMES.CSRF_TOKEN,
            CONTENT_TYPE_HEADER: HTTP_HEADERS.CONTENT_TYPE,
            APPLICATION_JSON: HTTP_HEADERS.APPLICATION_JSON,
            CSRF_TOKEN_HEADER: HTTP_HEADERS.CSRF_TOKEN,
            FORKLIFT_PATH: API_PATHS.FORKLIFT,
          },
        },
      );

      if (result.success && result.data) {
        return result.data as V1beta1Provider;
      }

      console.error(`Failed to create provider: ${result.error}`);
      return null;
    } catch (error) {
      console.error('Exception while creating provider:', error);
      return null;
    }
  }

  static async createSecret(
    page: Page,
    secret: IoK8sApiCoreV1Secret,
    namespace = MTV_NAMESPACE,
  ): Promise<IoK8sApiCoreV1Secret | null> {
    try {
      const result = await page.evaluate(
        async ({ secretData, ns, constants }) => {
          try {
            const getCsrfToken = () => {
              const cookies = document.cookie.split('; ');
              const csrfCookie = cookies.find((cookie) =>
                cookie.startsWith(`${constants.CSRF_TOKEN_NAME}=`),
              );
              return csrfCookie ? csrfCookie.split('=')[1] : '';
            };
            const csrfToken = getCsrfToken();

            const apiPath = `${constants.KUBERNETES_CORE}/namespaces/${ns}/secrets`;

            const response = await fetch(apiPath, {
              method: 'POST',
              headers: {
                [constants.CONTENT_TYPE_HEADER]: constants.APPLICATION_JSON,
                [constants.CSRF_TOKEN_HEADER]: csrfToken,
              },
              credentials: 'include',
              body: JSON.stringify(secretData),
            });

            if (response.ok) {
              return { success: true, data: await response.json() };
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
          secretData: secret,
          ns: namespace,
          constants: {
            CSRF_TOKEN_NAME: COOKIE_NAMES.CSRF_TOKEN,
            CONTENT_TYPE_HEADER: HTTP_HEADERS.CONTENT_TYPE,
            APPLICATION_JSON: HTTP_HEADERS.APPLICATION_JSON,
            CSRF_TOKEN_HEADER: HTTP_HEADERS.CSRF_TOKEN,
            KUBERNETES_CORE: API_PATHS.KUBERNETES_CORE,
          },
        },
      );

      if (result.success && result.data) {
        return result.data as IoK8sApiCoreV1Secret;
      }

      console.error(`Failed to create secret: ${result.error}`);
      return null;
    } catch (error) {
      console.error('Exception while creating secret:', error);
      return null;
    }
  }
}
